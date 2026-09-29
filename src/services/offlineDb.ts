/**
 * Community Health Report System (CHRS) - Offline Storage & IndexedDB Synchronization
 */

import { QueuedOfflineReport } from '../types';
import { api } from './api';

const DB_NAME = 'CHRS_Offline_Surveillance';
const DB_VERSION = 1;
const STORE_NAME = 'queued_reports';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'local_id' });
        store.createIndex('sync_status', 'sync_status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const offlineDb = {
  /**
   * Enqueue a health report locally when offline or poor network
   */
  async queueReport(reportData: Omit<QueuedOfflineReport, 'local_id' | 'timestamp' | 'sync_status'>): Promise<QueuedOfflineReport> {
    const db = await openDatabase();
    const queuedReport: QueuedOfflineReport = {
      ...reportData,
      local_id: `local-rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      sync_status: 'PENDING',
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(queuedReport);
      req.onsuccess = () => resolve(queuedReport);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Retrieve all reports currently queued in IndexedDB
   */
  async getQueuedReports(): Promise<QueuedOfflineReport[]> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Remove report after successful server synchronization
   */
  async removeReport(local_id: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(local_id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  /**
   * Update report status (e.g. SYNCING, FAILED)
   */
  async updateReport(local_id: string, updates: Partial<QueuedOfflineReport>): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get(local_id);
      getReq.onsuccess = () => {
        if (!getReq.result) return resolve();
        const updated = { ...getReq.result, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  },

  /**
   * Synchronize all pending local reports with the backend database
   */
  async syncPendingReports(): Promise<{ syncedCount: number; errorsCount: number }> {
    if (!navigator.onLine) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    const queued = await this.getQueuedReports();
    const pending = queued.filter((r) => r.sync_status === 'PENDING' || r.sync_status === 'FAILED');

    if (pending.length === 0) {
      return { syncedCount: 0, errorsCount: 0 };
    }

    // Mark as SYNCING
    for (const item of pending) {
      await this.updateReport(item.local_id, { sync_status: 'SYNCING' });
    }

    try {
      const res = await api.syncOfflineReports(pending);
      let syncedCount = 0;
      let errorsCount = 0;

      for (const result of res.results) {
        if (result.success) {
          await this.removeReport(result.local_id);
          syncedCount += 1;
        } else {
          await this.updateReport(result.local_id, {
            sync_status: 'FAILED',
            error_message: result.error,
          });
          errorsCount += 1;
        }
      }

      return { syncedCount, errorsCount };
    } catch (err: any) {
      for (const item of pending) {
        await this.updateReport(item.local_id, {
          sync_status: 'FAILED',
          error_message: err.message,
        });
      }
      return { syncedCount: 0, errorsCount: pending.length };
    }
  },
};
