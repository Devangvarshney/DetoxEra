"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Calendar, Activity, FileText, MessageCircle, AlertCircle, Leaf } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";

const NOTIFICATION_ICONS: Record<string, any> = {
  SESSION_SCHEDULED: { icon: Calendar, color: "bg-blue-100 text-blue-600", border: "border-blue-200" },
  SESSION_COMPLETED: { icon: CheckCheck, color: "bg-emerald-100 text-emerald-600", border: "border-emerald-200" },
  THERAPY_PLAN_CREATED: { icon: FileText, color: "bg-purple-100 text-purple-600", border: "border-purple-200" },
  FEEDBACK_RECEIVED: { icon: Activity, color: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  CHAT_MESSAGE: { icon: MessageCircle, color: "bg-teal-100 text-teal-600", border: "border-teal-200" },
  DEFAULT: { icon: Bell, color: "bg-ayur-green/10 text-ayur-green", border: "border-ayur-green/20" },
};

function getDateLabel(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}

function groupByDate(notifications: any[]) {
  const groups: Record<string, any[]> = {};
  for (const n of notifications) {
    const label = getDateLabel(n.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  const grouped = groupByDate([...notifications].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="h-16 rounded-2xl shimmer mb-6" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-outfit font-bold text-ayur-green-dark flex items-center gap-2">
            <Bell className="w-6 h-6" /> Notifications
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-ayur-muted text-sm mt-0.5">{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="gap-2 text-ayur-green border-ayur-green hover:bg-ayur-green/5"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-ayur-border rounded-2xl">
          <div className="w-16 h-16 bg-ayur-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-ayur-green" />
          </div>
          <h3 className="text-lg font-outfit font-semibold text-ayur-green-dark mb-2">All caught up!</h3>
          <p className="text-ayur-muted text-sm">No notifications yet. They'll appear here when you have sessions, updates, or messages.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-ayur-muted uppercase tracking-wider">{dateLabel}</span>
                <div className="flex-1 h-px bg-ayur-border" />
              </div>
              <div className="space-y-2">
                {items.map((notification: any) => {
                  const typeConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.DEFAULT;
                  const Icon = typeConfig.icon;
                  return (
                    <div
                      key={notification.id}
                      onClick={() => !notification.is_read && markReadMutation.mutate(notification.id)}
                      className={`
                        relative p-4 rounded-xl border transition-all cursor-pointer group
                        ${notification.is_read
                          ? "bg-white border-ayur-border hover:border-ayur-green/40"
                          : `bg-gradient-to-r from-white to-ayur-green/3 border-ayur-green/30 ${typeConfig.border} shadow-sm`
                        }
                      `}
                    >
                      {!notification.is_read && (
                        <div className="absolute top-4 right-4 w-2 h-2 bg-ayur-green rounded-full" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold mb-0.5 ${notification.is_read ? "text-ayur-muted" : "text-ayur-green-dark"}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-ayur-muted leading-relaxed whitespace-pre-line">
                            {notification.message}
                          </p>
                          <p className="text-xs text-ayur-muted mt-1.5">
                            {format(parseISO(notification.created_at), "h:mm a")}
                            {!notification.is_read && (
                              <span className="text-ayur-green ml-2 font-medium group-hover:underline">
                                · Mark as read
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
