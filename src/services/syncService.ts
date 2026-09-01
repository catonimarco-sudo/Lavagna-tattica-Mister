import mqtt, { MqttClient } from 'mqtt';
import { SyncSessionState } from '../types';

const SYNC_STORAGE_KEY_PREFIX = 'mister_tactics_state_v5_';
const ACTIVE_ROOM_KEY = 'mister_tactics_active_room_v5';

// Free, fast, CORS-enabled global Key-Value REST store (keyed directly by room ID)
const KV_APP_KEY = 'mister_tactics_v5_cloud';
const CLOUD_KV_BASE = 'https://keyvalue.immanuel.co/api/KeyVal';

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
  private isPushingToCloud: boolean = false;
  private isFetchingCloud: boolean = false;
  private brokerIndex: number = 0;
  private cloudPollTimer: number | null = null;

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

    // 2. Initialize channels
    this.initBroadcastChannel();
    this.connectMqtt();

    // 3. Initial Cloud Fetch & Polling
    setTimeout(() => {
      this.fetchFromCloud();
    }, 100);
    this.startPeriodicCloudSync();

    // 4. On mobile/desktop window focus or tab resume (crucial for iPhone Safari!)
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.fetchFromCloud();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.fetchFromCloud();
          if (!this.mqttClient || !this.mqttClient.connected) {
            this.connectMqtt();
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
          if (event.data && event.data.lastUpdated && event.data.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = event.data.lastUpdated;
            this.saveToLocalStorage(event.data);
            this.notifyListeners(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  // -------------------------------------------------------------
  // 2. High-Speed MQTT WebSocket Connection (with Retain for instant sync)
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
        connectTimeout: 5000,
        reconnectPeriod: 3000,
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

          // Ignore messages sent by ourselves
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
          console.warn('Error parsing incoming realtime MQTT packet:', err);
        }
      });

      this.mqttClient.on('error', (err) => {
        console.warn(`MQTT connection notice on ${brokerUrl}:`, err);
        this.setStatus('disconnected');
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
  // 6. Broadcast Local Changes to All Devices (AI Studio <-> Vercel PC <-> iPhone)
  // -------------------------------------------------------------
  public async publishUpdate(state: SyncSessionState): Promise<void> {
    const updatedState: SyncSessionState = {
      ...state,
      roomId: this.currentRoomId,
      lastUpdated: Date.now(),
    };

    this.lastKnownTimestamp = updatedState.lastUpdated;

    // 1. Save to local storage
    this.saveToLocalStorage(updatedState);

    // 2. Broadcast to other tabs on same device
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(updatedState);
      }
    } catch (e) {
      console.warn('Broadcast channel post error:', e);
    }

    // 3. Publish to live MQTT WebSocket with RETAIN = TRUE (so newly connecting devices get it immediately)
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
      console.warn('MQTT publish error:', e);
    }

    // 4. Push directly to Global Cloud Database by Room ID
    this.backupToCloud(updatedState);
  }

  // -------------------------------------------------------------
  // 7. Global Cloud Key-Value Database Sync
  // -------------------------------------------------------------
  private async backupToCloud(state: SyncSessionState) {
    if (this.isPushingToCloud) return;
    this.isPushingToCloud = true;

    try {
      const roomKey = this.currentRoomId;
      const jsonString = JSON.stringify(state);
      
      // Store on universal cloud KV API keyed by room ID
      const url = `${CLOUD_KV_BASE}/UpdateValue/${KV_APP_KEY}/${encodeURIComponent(roomKey)}/${encodeURIComponent(jsonString)}`;
      
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.warn('Cloud KV backup notice:', err);
    } finally {
      this.isPushingToCloud = false;
    }
  }

  public async fetchFromCloud(): Promise<SyncSessionState | null> {
    if (this.isFetchingCloud) return null;
    this.isFetchingCloud = true;

    try {
      const roomKey = this.currentRoomId;
      const url = `${CLOUD_KV_BASE}/GetValue/${KV_APP_KEY}/${encodeURIComponent(roomKey)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const rawValue = await res.text();
        if (rawValue && rawValue !== 'null' && rawValue !== '""' && rawValue.length > 5) {
          // Parse string or wrapped JSON
          let cleaned = rawValue.trim();
          if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
            try {
              cleaned = JSON.parse(cleaned);
            } catch {
              // keep cleaned
            }
          }

          const parsedState = typeof cleaned === 'string' ? JSON.parse(cleaned) : cleaned;

          if (
            parsedState &&
            parsedState.lastUpdated &&
            parsedState.lastUpdated > this.lastKnownTimestamp &&
            parsedState.drill
          ) {
            this.lastKnownTimestamp = parsedState.lastUpdated;
            this.saveToLocalStorage(parsedState);
            this.notifyListeners(parsedState);
            return parsedState;
          }
        }
      }
    } catch (err) {
      console.warn('Cloud KV fetch notice:', err);
    } finally {
      this.isFetchingCloud = false;
    }
    return null;
  }

  // -------------------------------------------------------------
  // 8. Background Auto-Sync Timer (every 3 seconds)
  // -------------------------------------------------------------
  private startPeriodicCloudSync() {
    if (this.cloudPollTimer) {
      clearInterval(this.cloudPollTimer);
    }
    this.cloudPollTimer = window.setInterval(() => {
      this.fetchFromCloud();
    }, 3000);
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
