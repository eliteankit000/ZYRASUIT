import { useState, useRef, useEffect } from "react";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Notification } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch notifications from API
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    staleTime: 30000, // Cache for 30 seconds
  });

  const { data: unreadData, isLoading: unreadLoading } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    staleTime: 30000,
  });

  const unreadCount = unreadData?.count || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Mutations for notification actions
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/clear-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to clear all notifications");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: "✅",
      warning: "⚠️", 
      error: "❌",
      info: "💡",
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Icon with Badge */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 flex items-center justify-center hover:bg-muted/50 transition-all duration-200",
          isOpen && "bg-muted/50"
        )}
        data-testid="button-notification-center"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
            data-testid="badge-notification-count"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute right-0 top-full mt-2 z-50",
            "w-80 sm:w-96", // Responsive width
            "bg-gradient-to-br from-[#021024] to-[#052659]",
            "rounded-lg border border-border/50 shadow-2xl",
            "backdrop-blur-sm",
            "max-h-[80vh] overflow-hidden",
            "animate-in slide-in-from-top-2 duration-200"
          )}
          data-testid="dropdown-notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white h-8 w-8 p-0 flex items-center justify-center"
              data-testid="button-close-notifications"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 text-sm">No notifications yet</p>
                <p className="text-slate-400 text-xs mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="space-y-0">
                {notifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-border/20 hover:bg-white/5 transition-colors",
                      !notification.isRead && "bg-primary/10",
                      index === notifications.length - 1 && "border-b-0"
                    )}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className="font-bold text-white text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>

                        {/* Message */}
                        <p className="text-slate-300 text-sm mb-2 line-clamp-2">
                          {notification.message}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">
                            {notification.createdAt ? formatTimeAgo(new Date(notification.createdAt)) : "Unknown"}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {notification.actionUrl && notification.actionLabel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 text-primary hover:text-primary-foreground hover:bg-primary"
                                data-testid={`button-action-${notification.id}`}
                              >
                                {notification.actionLabel}
                              </Button>
                            )}
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs h-6 px-2 text-slate-400 hover:text-white"
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-slate-300 hover:text-white hover:bg-white/10"
                data-testid="button-clear-all"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}