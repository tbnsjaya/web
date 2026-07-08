import { create } from "zustand";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (notifications: NotificationItem[]) => void;
  markAsRead: (id: string) => void;
  addNotification: (item: NotificationItem) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      const unreadCount = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount };
    }),
  addNotification: (item) =>
    set((state) => {
      const updated = [item, ...state.notifications];
      const unreadCount = updated.filter((n) => !n.isRead).length;
      return { notifications: updated, unreadCount };
    }),
}));
