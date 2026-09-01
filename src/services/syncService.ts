import mqtt, { MqttClient } from 'mqtt';
import { SyncSessionState } from '../types';

const SYNC_STORAGE_KEY_PREFIX = 'mister_tactics_state_v5_';
const ACTIVE_ROOM_KEY = 'mister_tactics_active_room_v5';

// High-speed multi-broker redundancy
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
  private eventSource: EventSource | null = null;
  private connectionStatus: ConnectionStatus = 'connecting';

  private listeners: ((state: SyncSessionState) => void)[] = [];
  private statusListeners: ((status: ConnectionStatus) => void)[] = [];

  private lastKnownTimestamp: number = 0;
  private isPushingToCloud: boolean = false;
  private isFetchingCloud: boolean = false;
  private brokerIndex: number = 0;
  private pollIntervalTimer: number | null = null;

  private constructor() {
    // 1. Read Room ID from URL query or LocalStorage
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      const savedRoom =
        localStorage.getItem(ACTIVE_ROOM_KEY) ||
        localStorage.getItem('mister_tactics_active_room_v4');

      if (roomParam) {
        this.currentRoomId = this.sanitizeRoomId(roomParam);
      } else if (savedRoom) {
        this.currentRoomId = this.sanitizeRoomId(savedRoom);
      }
      localStorage.setItem(ACTIVE_ROOM_KEY, this.currentRoomId);
    }

    // 2. Initialize local state cache timestamp
    const cached = this.getSavedLocalState();
    if (cached && cached.lastUpdated) {
      this.lastKnownTimestamp = cached.lastUpdated;
    }

    // 3. Connect channels (BroadcastChannel, MQTT, and SSE Cloud Stream)
    this.initBroadcastChannel();
    this.connectMqtt();
    this.connectCloudStream();

    // 4. Initial immediate fetch from Cloud
    this.fetchFromCloud();

    // 5. Periodic cloud polling fallback (every 3.5s)
    this.startPeriodicSync();

    // 6. Handle tab resume / wakeups (crucial for iPhone Safari!)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.fetchFromCloud();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchFromCloud();
          if (!this.eventSource || this.eventSource.readyState === EventSource.CLOSED) {
            this.connectCloudStream();
          }
        }
      });
    }
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

  public sanitizeRoomId(roomId: string): string {
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
  // 1. Native Local BroadcastChannel (Sync across browser tabs on same PC/Mac)
  // -------------------------------------------------------------
  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        if (this.broadcastChannel) {
          this.broadcastChannel.close();
        }
        this.broadcastChannel = new BroadcastChannel(`tactics_sync_${this.currentRoomId}`);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.lastUpdated && event.data.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = event.data.lastUpdated;
            this.saveToLocalStorage(event.data);
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel notice:', e);
    }
  }

  // -------------------------------------------------------------
  // 2. High-Speed Cloud SSE Push Stream (Mobile & Desktop Native Push)
  // -------------------------------------------------------------
  private connectCloudStream() {
    if (typeof window === 'undefined' || !('EventSource' in window)) return;

    try {
      if (this.eventSource) {
        this.eventSource.close();
      }

      const streamUrl = `https://ntfy.sh/mister_tactics_v5_${this.currentRoomId}/sse`;
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.setStatus('connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.event === 'message' && parsed.message) {
            const innerState: SyncSessionState = JSON.parse(parsed.message);
            if (
              innerState &&
              innerState.lastUpdated &&
              innerState.lastUpdated > this.lastKnownTimestamp &&
              innerState.drill
            ) {
              this.lastKnownTimestamp = innerState.lastUpdated;
              this.saveToLocalStorage(innerState);
              this.notifyListeners(innerState);
            }
          }
        } catch (e) {
          // non-json message, ignore
        }
      };

      this.eventSource.onerror = () => {
        // Fallback to polling / MQTT if stream disconnects
        this.eventSource?.close();
      };
    } catch (err) {
      console.warn('EventSource initialization notice:', err);
    }
  }

  // -------------------------------------------------------------
  // 3. MQTT WebSocket Connection (Secondary real-time mesh)
  // -------------------------------------------------------------
  private connectMqtt() {
    const brokerUrl = MQTT_BROKERS[this.brokerIndex % MQTT_BROKERS.length];

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
        connectTimeout: 5000,
        reconnectPeriod: 4000,
        keepalive: 30,
      });

      const currentTopic = `mister_tactics_v5/${this.currentRoomId}`;

      this.mqttClient.on('connect', () => {
        this.setStatus('connected');
        this.mqttClient?.subscribe(currentTopic, { qos: 1 });
      });

      this.mqttClient.on('message', (topic, message) => {
        try {
          const raw = message.toString();
          const parsed = JSON.parse(raw);

          if (parsed.senderId === this.clientId) {
            return;
          }

          const remoteState: SyncSessionState = parsed.data || parsed.state || parsed;

          if (
            remoteState &&
            remoteState.lastUpdated &&
            remoteState.lastUpdated > this.lastKnownTimestamp &&
            remoteState.drill
          ) {
            this.lastKnownTimestamp = remoteState.lastUpdated;
            this.saveToLocalStorage(remoteState);
            this.notifyListeners(remoteState);
          }
        } catch (err) {
          console.warn('Error parsing incoming MQTT message:', err);
        }
      });

      this.mqttClient.on('error', () => {
        this.brokerIndex++;
      });
    } catch (e) {
      console.warn('MQTT init notice:', e);
    }
  }

  // -------------------------------------------------------------
  // 4. Room Management
  // -------------------------------------------------------------
  public setRoomId(newRoomId: string, currentState?: SyncSessionState) {
    const cleanId = this.sanitizeRoomId(newRoomId);
    if (cleanId === this.currentRoomId) return;

    this.currentRoomId = cleanId;
    localStorage.setItem(ACTIVE_ROOM_KEY, cleanId);

    // Rebind local & remote channels
    this.initBroadcastChannel();
    this.connectMqtt();
    this.connectCloudStream();

    if (currentState) {
      this.publishUpdate({ ...currentState, roomId: cleanId, lastUpdated: Date.now() });
    } else {
      this.fetchFromCloud();
    }
  }

  // -------------------------------------------------------------
  // 5. Subscriptions
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
  // 6. Local Storage Helper
  // -------------------------------------------------------------
  public getSavedLocalState(): SyncSessionState | null {
    try {
      const raw =
        localStorage.getItem(`${SYNC_STORAGE_KEY_PREFIX}${this.currentRoomId}`) ||
        localStorage.getItem(`mister_tactics_state_v4_${this.currentRoomId}`);
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

  public saveToLocalStorage(state: SyncSessionState) {
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
  // 7. Broadcast Local Updates (AI Studio ⇄ Vercel PC ⇄ Vercel iPhone)
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

    // 2. Broadcast to other tabs
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(updatedState);
      }
    } catch (e) {
      console.warn('Broadcast channel post notice:', e);
    }

    // 3. Publish to MQTT WebSocket
    try {
      if (this.mqttClient && this.mqttClient.connected) {
        const currentTopic = `mister_tactics_v5/${this.currentRoomId}`;
        this.mqttClient.publish(
          currentTopic,
          JSON.stringify({
            type: 'STATE_UPDATE',
            senderId: this.clientId,
            roomId: this.currentRoomId,
            data: updatedState,
          }),
          { qos: 1, retain: true }
        );
      }
    } catch (e) {
      console.warn('MQTT publish notice:', e);
    }

    // 4. Send to Cloud REST / SSE Bus with body (instant delivery to iPhone & Vercel)
    if (!this.isPushingToCloud) {
      this.isPushingToCloud = true;
      try {
        const payloadString = JSON.stringify(updatedState);
        await fetch(`https://ntfy.sh/mister_tactics_v5_${this.currentRoomId}`, {
          method: 'POST',
          headers: {
            'Title': `tactics_${this.currentRoomId}`,
            'Tags': 'soccer,tactics',
          },
          body: payloadString,
        });
      } catch (err) {
        console.warn('Cloud sync push notice:', err);
      } finally {
        this.isPushingToCloud = false;
      }
    }
  }

  // -------------------------------------------------------------
  // 8. Fetch Latest State from Global Cloud
  // -------------------------------------------------------------
  public async fetchFromCloud(): Promise<SyncSessionState | null> {
    if (this.isFetchingCloud) return null;
    this.isFetchingCloud = true;

    try {
      const res = await fetch(
        `https://ntfy.sh/mister_tactics_v5_${this.currentRoomId}/json?poll=1&since=all`
      );
      if (res.ok) {
        const text = await res.text();
        if (text) {
          // ntfy /json endpoint returns newline-delimited JSON objects
          const lines = text.trim().split('\n');
          for (let i = lines.length - 1; i >= 0; i--) {
            try {
              const item = JSON.parse(lines[i]);
              if (item && item.event === 'message' && item.message) {
                const remoteState: SyncSessionState = JSON.parse(item.message);
                if (
                  remoteState &&
                  remoteState.lastUpdated &&
                  remoteState.lastUpdated > this.lastKnownTimestamp &&
                  remoteState.drill
                ) {
                  this.lastKnownTimestamp = remoteState.lastUpdated;
                  this.saveToLocalStorage(remoteState);
                  this.notifyListeners(remoteState);
                  this.setStatus('connected');
                  return remoteState;
                }
              }
            } catch {
              // try previous line
            }
          }
        }
      }
    } catch (err) {
      console.warn('Cloud fetch notice:', err);
    } finally {
      this.isFetchingCloud = false;
    }
    return null;
  }

  // -------------------------------------------------------------
  // 9. Periodic polling check (fallback every 3.5s)
  // -------------------------------------------------------------
  private startPeriodicSync() {
    if (this.pollIntervalTimer) {
      clearInterval(this.pollIntervalTimer);
    }
    this.pollIntervalTimer = window.setInterval(() => {
      this.fetchFromCloud();
    }, 3500);
  }

  public destroy() {
    if (this.pollIntervalTimer) {
      clearInterval(this.pollIntervalTimer);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    if (this.mqttClient) {
      this.mqttClient.end(true);
    }
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
