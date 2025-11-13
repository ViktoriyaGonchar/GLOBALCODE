'use client';

import { useState, useEffect } from 'react';
import { notificationApi, Notification } from '@/lib/api/notification';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/lib/socket/notification.socket';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function NotificationBell() {
  const { isAuthenticated, token } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Загружаем количество непрочитанных
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationApi.getUnreadCount();
        if (response.success && response.data) {
          setUnreadCount(response.data.count);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();

    // Подключаемся к WebSocket
    const socket = connectNotificationSocket(
      (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      },
      (count) => {
        setUnreadCount(count);
      }
    );

    // Загружаем непрочитанные уведомления
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationApi.getUnreadNotifications();
        if (response.success && response.data) {
          setNotifications(response.data);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      disconnectNotificationSocket();
    };
  }, [isAuthenticated, token]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Отметить все как прочитанные
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Загрузка...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Нет уведомлений
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link || '#'}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                    setShowDropdown(false);
                  }}
                  className={`block p-4 hover:bg-accent transition-colors ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="p-4 border-t text-center">
            <Link
              href="/notifications"
              className="text-sm text-primary hover:underline"
              onClick={() => setShowDropdown(false)}
            >
              Показать все уведомления
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

