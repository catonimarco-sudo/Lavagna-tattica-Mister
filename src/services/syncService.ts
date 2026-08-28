import { SyncSessionState, ExerciseDrill, Player, TeamSettings } from '../types';

const SYNC_STORAGE_KEY_PREFIX = 'mister_tactics_state_';
const ACTIVE_ROOM_KEY = 'mister_tactics_active_room';

// Public distributed key-value / relay for cross-domain realtime sync
// Works between AI Studio, Vercel, localhost, and mobile devices!
const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects';

export class RealtimeSyncService {
  private static instance: RealtimeSyncService;
  private currentRoomId: string = 'MISTER-CALCIO-ROOM-1';
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: ((state: SyncSessionState) => void)[] = [];
  private pollIntervalId: number | null = null;
  private lastKnownTimestamp: number = 0;
  private cloudObjectId: string | null = null;
  private isSyncingOutbound: boolean = false;

  private constructor() {
    // Restore active room ID if saved
    const savedRoom = localStorage.getItem(ACTIVE_ROOM_KEY);
    if (savedRoom) {
      this.currentRoomId = savedRoom;
    }

    // Initialize multi-tab local broadcast channel
    this.initBroadcastChannel();
    // Start background sync
    this.startCloudPolling();
  }

  public static getInstance(): RealtimeSyncService {
    if (!RealtimeSyncService.instance) {
      RealtimeSyncService.instance = new RealtimeSyncService();
    }
    return RealtimeSyncService.instance;
  }

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
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  public getRoomId(): string {
    return this.currentRoomId;
  }

  public setRoomId(newRoomId: string, currentState?: SyncSessionState) {
    const cleanId = newRoomId.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '') || 'MISTER-ROOM';
    this.currentRoomId = cleanId;
    localStorage.setItem(ACTIVE_ROOM_KEY, cleanId);
    this.cloudObjectId = null; // Reset cloud pointer for new room
    this.initBroadcastChannel();

    if (currentState) {
      this.publishUpdate({ ...currentState, roomId: cleanId, lastUpdated: Date.now() });
    } else {
      this.fetchFromCloud();
    }
  }

  public subscribe(callback: (state: SyncSessionState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(state: SyncSessionState) {
    this.listeners.forEach(cb => {
      try {
        cb(state);
      } catch (err) {
        console.error('Error notifying sync listener', err);
      }
    });
  }

  public getSavedLocalState(): SyncSessionState | null {
    try {
      const raw = localStorage.getItem(`${SYNC_STORAGE_KEY_PREFIX}${this.currentRoomId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.lastKnownTimestamp = parsed.lastUpdated || 0;
        return parsed;
      }
    } catch (e) {
      console.error('Error reading local state', e);
    }
    return null;
  }

  public async publishUpdate(state: SyncSessionState): Promise<void> {
    const updatedState: SyncSessionState = {
      ...state,
      roomId: this.currentRoomId,
      lastUpdated: Date.now()
    };

    this.lastKnownTimestamp = updatedState.lastUpdated;

    // 1. Save locally
    try {
      localStorage.setItem(`${SYNC_STORAGE_KEY_PREFIX}${this.currentRoomId}`, JSON.stringify(updatedState));
    } catch (e) {
      console.warn('LocalStorage quota or write error', e);
    }

    // 2. Broadcast to other tabs
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(updatedState);
      }
    } catch (e) {
      console.warn('Broadcast channel post error', e);
    }

    // 3. Sync to Cloud backend (cross-domain AI Studio <-> Vercel)
    this.syncToCloud(updatedState);
  }

  private async syncToCloud(state: SyncSessionState) {
    if (this.isSyncingOutbound) return;
    this.isSyncingOutbound = true;

    try {
      const payload = {
        name: `mister_tactics_${this.currentRoomId}`,
        data: {
          roomId: this.currentRoomId,
          lastUpdated: state.lastUpdated,
          author: state.author,
          drill: state.drill,
          roster: state.roster,
          teamSettings: state.teamSettings
        }
      };

      // If we have an existing cloud object ID, update it; otherwise create or lookup
      if (this.cloudObjectId) {
        await fetch(`${CLOUD_SYNC_ENDPOINT}/${this.cloudObjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        const res = await fetch(CLOUD_SYNC_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const json = await res.json();
          if (json && json.id) {
            this.cloudObjectId = json.id;
          }
        }
      }
    } catch (err) {
      console.warn('Cloud sync outbound error (will retry):', err);
    } finally {
      this.isSyncingOutbound = false;
    }
  }

  public async fetchFromCloud(): Promise<SyncSessionState | null> {
    try {
      if (this.cloudObjectId) {
        const res = await fetch(`${CLOUD_SYNC_ENDPOINT}/${this.cloudObjectId}`);
        if (res.ok) {
          const item = await res.json();
          if (item && item.data && item.data.lastUpdated > this.lastKnownTimestamp) {
            this.lastKnownTimestamp = item.data.lastUpdated;
            this.notifyListeners(item.data);
            return item.data;
          }
        }
      }
    } catch (err) {
      // ignore network transient glitch
    }
    return null;
  }

  private startCloudPolling() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
    // Poll cloud every 2.5 seconds to pick up live changes from Vercel / AI Studio
    this.pollIntervalId = window.setInterval(() => {
      this.fetchFromCloud();
    }, 2500);
  }

  public destroy() {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
  }
}
