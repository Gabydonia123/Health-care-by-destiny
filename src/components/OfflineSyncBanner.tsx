/**
 * Community Health Report System (CHRS) - Offline & Network Synchronization Banner
 */

import React, { useEffect, useState } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';
import { offlineDb } from '../services/offlineDb';

interface OfflineSyncBannerProps {
  onSyncComplete?: () => void;
}

export const OfflineSyncBanner: React.FC<OfflineSyncBannerProps> = ({ onSyncComplete }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const checkPendingQueue = async () => {
    try {
      const reports = await offlineDb.getQueuedReports();
      setPendingCount(reports.length);
    } catch {
      // IndexedDB might not be available
    }
  };

  useEffect(() => {
    checkPendingQueue();

    const handleOnline = async () => {
      setIsOnline(true);
      // Auto-sync when connection restores
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(checkPendingQueue, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const triggerSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const result = await offlineDb.syncPendingReports();
      await checkPendingQueue();

      if (result.syncedCount > 0) {
        setSyncFeedback(`Successfully synchronized ${result.syncedCount} offline report(s) with national database.`);
        setTimeout(() => setSyncFeedback(null), 5000);
        if (onSyncComplete) onSyncComplete();
      } else if (result.errorsCount > 0) {
        setSyncFeedback(`Sync encountered ${result.errorsCount} error(s). Will retry automatically.`);
        setTimeout(() => setSyncFeedback(null), 5000);
      }
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingCount === 0 && !syncFeedback) {
    return null;
  }

  return (
    <div
      id="offline-sync-banner"
      className={`w-full py-2 px-4 transition-colors text-xs sm:text-sm font-medium flex flex-wrap items-center justify-between gap-3 ${
        !isOnline
          ? 'bg-amber-500 text-amber-950'
          : pendingCount > 0
          ? 'bg-emerald-700 text-emerald-50'
          : 'bg-emerald-600 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <CloudOff className="w-4 h-4 text-amber-950 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> You can still prepare and submit health reports. They will be stored securely in local device storage (IndexedDB) and uploaded when internet reconnects.
            </span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <Cloud className="w-4 h-4 text-emerald-200" />
            <span>
              <strong>Online:</strong> You have <strong>{pendingCount}</strong> queued offline report(s) ready to synchronize with the nearest health facility.
            </span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>{syncFeedback}</span>
          </>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          id="sync-now-btn"
          onClick={triggerSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 bg-white text-emerald-900 rounded-md font-semibold text-xs hover:bg-emerald-50 transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Synchronizing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
};
