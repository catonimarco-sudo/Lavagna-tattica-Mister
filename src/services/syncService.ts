import mqtt, { MqttClient } from 'mqtt';
import { SyncSessionState } from '../types';

const SYNC_STORAGE_KEY_PREFIX = 'mister_tactics_state_v4_';
const ACTIVE_ROOM_KEY = 'mister_tactics_active_room_v4';

// Public distributed key-value endpoint for initial offline snapshots
const CLOUD_KV_ENDPOINT = 'https://api.restful-api.dev/objects';

// High-speed public MQTT WebSocket Brokers (multi-server redundancy)
const MQTT_BROKERS = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
];

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing';

export class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private currentRoomId: string = 'MISTER-CALCIO-ROOM-1';
  private clientId: string = `coach_${Math.random().toString(36).substring(2, 9)}`;
  private broadcastChannel: BroadcastChannel | null = null;
  private mqttClient: MqttClient | null = null;
  private connectionStatus: ConnectionStatus = 'connecting';
  
  private listeners: ((state: SyncSessionState) => void)[] = [];
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];
  
  private lastKnownTimestamp: number = 0;
  private isPublishing: boolean = false;
  private cloudBackupId: string | null = null;
  private brokerIndex: number = 0;
  private cloudPollTimer: number | null = null;

  private constructor() {
    // Restore active room ID if saved in localStorage or URL query
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      const savedRoom = localStorage.getItem(ACTIVE_ROOM_KEY);
      
      if (roomParam) {
        this.currentRoomId = this.sanitizeRoomId(roomParam);
      } else if (savedRoom) {
        this.currentRoomId = this.sanitizeRoomId(savedRoom);
      }
    }

    this.initBroadcastChannel();
    this.connectMqtt();
    this.startPeriodicCloudSync();
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  private sanitizeRoomId(roomId: string): string {
    const cleaned = roomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    return cleaned || 'MISTER-CALCIO-ROOM-1';
  }

  public getRoomId(): string {
    return this.currentRoomId;
  }

  public getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  private setStatus(status: ConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach((cb) => {
      try {
        cb(status);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    });
  }

  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.connectionStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((cb) => cb !== callback);
    };
  }

  // -------------------------------------------------------------
  // 1. Multi-Tab Local Broadcast
  // -------------------------------------------------------------
  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        if (this.broadcastChannel) {
          this.broadcastChannel.close();
        }
        this.broadcastChannel = new BroadcastChannel(`tactics_sync_${this.currentRoomId}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = event.data.lastUpdated;
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported in this browser:', e);
    }
  }

  // -------------------------------------------------------------
  // 2. High-Speed MQTT WebSocket Connection (AI Studio <-> Vercel)
  // -------------------------------------------------------------
  private connectMqtt() {
    const brokerUrl = MQTT_BROKERS[this.brokerIndex % MQTT_BROKERS.length];
    this.setStatus('connecting');

    try {
      if (this.mqttClient) {
        try {
          this.mqttClient.end(true);
        } catch {
          // ignore
        }
      }

      this.mqttClient = mqtt.connect(brokerUrl, {
        clientId: `${this.clientId}_${Math.floor(Math.random() * 10000)}`,
        clean: true,
        connectTimeout: 6000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      const currentTopic = `mister_tactics_v4/${this.currentRoomId}`;

      this.mqttClient.on('connect', () => {
        this.setStatus('connected');
        this.mqttClient?.subscribe(currentTopic, { qos: 1 }, (err) => {
          if (!err) {
            // Ask any active online coach on this room for their latest state snapshot
            this.mqttClient?.publish(
              currentTopic,
              JSON.stringify({
                type: 'REQUEST_SYNC',
                senderId: this.clientId,
                roomId: this.currentRoomId,
                timestamp: Date.now(),
              })
            );
          }
        });
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const raw = message.toString();
          const parsed = JSON.parse(raw);

          // Ignore messages sent by ourselves
          if (parsed.senderId === this.clientId) {
            return;
          }

          // Handle SYNC request from newly joined peer
          if (parsed.type === 'REQUEST_SYNC') {
            const localSaved = this.getSavedLocalState();
            if (localSaved && localSaved.lastUpdated) {
              this.mqttClient?.publish(
                currentTopic,
                JSON.stringify({
                  type: 'STATE_SNAPSHOT',
                  senderId: this.clientId,
                  roomId: this.currentRoomId,
                  state: localSaved,
                })
              );
            }
            return;
          }

          // Handle state updates or state snapshots
          const remoteState: SyncSessionState =
            parsed.type === 'STATE_SNAPSHOT' ? parsed.state : parsed.data || parsed;

          if (remoteState && remoteState.lastUpdated && remoteState.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = remoteState.lastUpdated;
            this.saveToLocalStorage(remoteState);
            this.notifyListeners(remoteState);
          }
        } catch (err) {
          console.warn('Error parsing incoming realtime MQTT packet:', err);
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn(`MQTT connection error on ${brokerUrl}:`, err);
        this.setStatus('disconnected');
        // Try fallback broker
        this.brokerIndex++;
      });

      this.mqttClient.on('offline', () => {
        this.setStatus('disconnected');
      });

      this.mqttClient.on('reconnect', () => {
        this.setStatus('connecting');
      });
    } catch (e) {
      console.error('Failed to initialize MQTT client:', e);
      this.setStatus('disconnected');
    }
  }

  // -------------------------------------------------------------
  // 3. Room Management
  // -------------------------------------------------------------
  public setRoomId(newRoomId: string, currentState?: SyncSessionState) {
    const cleanId = this.sanitizeRoomId(newRoomId);
    if (cleanId === this.currentRoomId) return;

    this.currentRoomId = cleanId;
    localStorage.setItem(ACTIVE_ROOM_KEY, cleanId);
    this.cloudBackupId = null;

    // Rebind local & remote channels
    this.initBroadcastChannel();
    this.connectMqtt();

    if (currentState) {
      this.publishUpdate({ ...currentState, roomId: cleanId, lastUpdated: Date.now() });
    } else {
      this.fetchFromCloud();
    }
  }

  // -------------------------------------------------------------
  // 4. Subscriptions & Notification
  // -------------------------------------------------------------
  public subscribe(callback: (state: SyncSessionState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(state: SyncSessionState) {
    this.listeners.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  // -------------------------------------------------------------
  // 5. Local Storage
  // -------------------------------------------------------------
  public getSavedLocalState(): SyncSessionState | null {
    try {
      const raw = localStorage.getItem(`${SYNC_STORAGE_KEY_PREFIX}${this.currentRoomId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.lastUpdated) {
          this.lastKnownTimestamp = Math.max(this.lastKnownTimestamp, parsed.lastUpdated);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading local state:', e);
    }
    return null;
  }

  private saveToLocalStorage(state: SyncSessionState) {
    try {
      localStorage.setItem(
        `${SYNC_STORAGE_KEY_PREFIX}${this.currentRoomId}`,
        JSON.stringify(state)
      );
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // -------------------------------------------------------------
  // 6. Broadcast Local Changes to All Remote Instances (Vercel <-> AI Studio)
  // -------------------------------------------------------------
  public async publishUpdate(state: SyncSessionState): Promise<void> {
    const updatedState: SyncSessionState = {
      ...state,
      roomId: this.currentRoomId,
      lastUpdated: Date.now(),
    };

    this.lastKnownTimestamp = updatedState.lastUpdated;

    // 1. Save locally
    this.saveToLocalStorage(updatedState);

    // 2. Broadcast to local tabs on same device
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(updatedState);
      }
    } catch (e) {
      console.warn('Broadcast channel post error:', e);
    }

    // 3. Publish to live MQTT WebSocket Topic (ultra-fast sub-100ms)
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        const currentTopic = `mister_tactics_v4/${this.currentRoomId}`;
        this.mqttClient.publish(
          currentTopic,
          JSON.stringify({
            type: 'STATE_UPDATE',
            senderId: this.clientId,
            roomId: this.currentRoomId,
            data: updatedState,
          }),
          { qos: 1 }
        );
      }
    } catch (e) {
      console.warn('MQTT publish error:', e);
    }

    // 4. Asynchronous Cloud Key-Value persistence
    this.backupToCloud(updatedState);
  }

  // -------------------------------------------------------------
  // 7. Cloud Persistence Fallback (REST API)
  // -------------------------------------------------------------
  private async backupToCloud(state: SyncSessionState) {
    if (this.isPublishing) return;
    this.isPublishing = true;

    try {
      const payload = {
        name: `mister_tactics_room_${this.currentRoomId}`,
        data: {
          roomId: this.currentRoomId,
          lastUpdated: state.lastUpdated,
          author: state.author || 'Coach',
          drill: state.drill,
          roster: state.roster,
          teamSettings: state.teamSettings,
        },
      };

      if (this.cloudBackupId) {
        await fetch(`${CLOUD_KV_ENDPOINT}/${this.cloudBackupId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        const res = await fetch(CLOUD_KV_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.id) {
            this.cloudBackupId = json.id;
          }
        }
      }
    } catch (err) {
      // transient network log
    } finally {
      this.isPublishing = false;
    }
  }

  public async fetchFromCloud(): Promise<SyncSessionState | null> {
    try {
      if (this.cloudBackupId) {
        const res = await fetch(`${CLOUD_KV_ENDPOINT}/${this.cloudBackupId}`);
        if (res.ok) {
          const item = await res.json();
          if (item && item.data && item.data.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = item.data.lastUpdated;
            this.saveToLocalStorage(item.data);
            this.notifyListeners(item.data);
            return item.data;
          }
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private startPeriodicCloudSync() {
    if (this.cloudPollTimer) {
      clearInterval(this.cloudPollTimer);
    }
    this.cloudPollTimer = window.setInterval(() => {
      this.fetchFromCloud();
    }, 4000);
  }

  public destroy() {
    if (this.cloudPollTimer) {
      clearInterval(this.cloudPollTimer);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    if (this.mqttClient) {
      this.mqttClient.end(true);
    }
  }
}
