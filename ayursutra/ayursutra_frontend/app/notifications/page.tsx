"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, FileText, Calendar } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await api.get("/notifications");
      return res.data;
    },
    enabled: !!user,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch("/notifications/read-all");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications"] });
    }
  });

  if (!user) return null;

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-ayur-muted">Loading notifications...</div>;
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "SESSION_SCHEDULED":
      case "SESSION_COMPLETED":
        return <Calendar className="w-5 h-5" />;
      case "THERAPY_PLAN_CREATED":
        return <FileText className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const hasUnread = notifications?.some((n: any) => !n.is_read);

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-outfit font-bold text-ayur-green-dark flex items-center gap-3">
            <Bell className="w-7 h-7" />
            Notifications
          </h1>
          <p className="text-ayur-muted mt-1">Stay updated on your Ayurvedic journey.</p>
        </div>
        
        {hasUnread && (
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification: any) => (
            <Card key={notification.id} className={`glass-card transition-colors ${!notification.is_read ? 'border-l-4 border-l-ayur-accent bg-ayur-accent/5' : ''}`}>
              <CardContent className="p-5 flex gap-4">
                <div className={`p-3 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-ayur-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold ${!notification.is_read ? 'text-ayur-green-dark' : 'text-gray-700'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-ayur-muted whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-ayur-text leading-relaxed">
                    {notification.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 border border-dashed border-ayur-border rounded-lg glass-card">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No notifications yet</h3>
            <p className="text-ayur-muted">When you have new activity, it will show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
