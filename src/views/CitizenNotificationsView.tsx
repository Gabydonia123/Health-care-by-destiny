/**
 * Community Health Report System (CHRS) - Citizen Notifications View
 */

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCheck,
  Clock,
  FileText,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Notification } from '../types';

export const CitizenNotificationsView: React.FC<{ onNavigate: (view: string) => void }> = ({
  onNavigate,
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!authLoading) {
      loadNotifications();
    }
  }, [authLoading, isAuthenticated]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        setNotifications([]);
        return;
      }
      const res = await api.getCitizenNotifications();
      setNotifications(res.notifications || []);
    } catch (err: any) {
      console.warn('Could not load notifications:', err?.message || err);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const displayedNotifications = filterUnreadOnly
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <span>Surveillance Notifications & Status Updates</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time notifications regarding report routing, clinical reviews, and health alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-emerald-700" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilterUnreadOnly(false)}
          className={`px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
            !filterUnreadOnly
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterUnreadOnly(true)}
          className={`px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
            filterUnreadOnly
              ? 'bg-emerald-700 text-white border-emerald-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {displayedNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No notifications to display</h3>
          <p className="text-xs text-slate-500 mt-1">
            You will receive updates here whenever a health officer inspects or verifies your report.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                !notif.is_read
                  ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                    notif.type === 'ALERT'
                      ? 'bg-red-100 text-red-700'
                      : notif.type === 'CLUSTER'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {notif.type === 'ALERT' ? (
                    <Radio className="w-4 h-4" />
                  ) : notif.type === 'CLUSTER' ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(notif.created_at).toLocaleString('en-GB')}</span>
                    {notif.reference_id && (
                      <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        Ref: {notif.reference_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!notif.is_read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  title="Mark as Read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 transition cursor-pointer flex-shrink-0"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
