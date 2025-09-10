import { DatabaseService, db } from '@/lib/database';

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresIn?: number; // in milliseconds
}

class OfflineService {
  private static instance: OfflineService;
  private cache = new Map<string, CachedData>();

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  // Cache data with optional expiration
  async cacheData(key: string, data: any, expiresIn?: number): Promise<void> {
    const cachedItem: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresIn
    };
    
    this.cache.set(key, cachedItem);
    
    // Also store in IndexedDB for persistence
    try {
      await db.syncQueue.add({
        id: Math.random(),
        action: 'cache',
        data: cachedItem,
        timestamp: new Date(),
        retryCount: 0
      });
    } catch (error) {
      console.log('Cache storage error:', error);
    }
  }

  // Get cached data
  getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (cached.expiresIn && (Date.now() - cached.timestamp) > cached.expiresIn) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Check if device is offline
  isOffline(): boolean {
    return !navigator.onLine;
  }

  // Queue action for when back online
  async queueOfflineAction(action: string, data: any): Promise<void> {
    await DatabaseService.addToSyncQueue(action, data);
  }

  // Process offline queue when back online
  async processOfflineQueue(): Promise<void> {
    if (this.isOffline()) return;
    
    await DatabaseService.processSyncQueue();
  }

  // Sync data when back online
  async syncWhenOnline(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // Use postMessage for communication with service worker
        registration.active?.postMessage({ type: 'SYNC_QUEUE' });
      } catch (error) {
        console.log('Service worker sync failed:', error);
      }
    }
    // Always run fallback sync
    await this.processOfflineQueue();
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (cached.expiresIn && (now - cached.timestamp) > cached.expiresIn) {
        this.cache.delete(key);
      }
    }
  }
}

export const offlineService = OfflineService.getInstance();