import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardContentSkeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/dashboard/sidebar";
import AITools from "@/components/dashboard/ai-tools";
import AutomationTools from "@/components/dashboard/automation-tools";
import Campaigns from "@/components/dashboard/campaigns";
import GrowthDashboard from "@/components/dashboard/growth-dashboard";
import Settings from "@/components/dashboard/settings";
import Profile from "@/components/dashboard/profile";
import { useAuth } from "@/lib/auth";
import { useDashboard, useSkeletonLoader, useConnectionStatus } from "@/hooks/useDashboard";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Zap, TrendingUp, ShoppingCart, Eye, RotateCcw, Plus, Bell, Menu, Wifi, WifiOff, X, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Notification Center State
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "✨ New A/B test results ready",
      message: "Your product description test shows 23% higher engagement",
      timestamp: "2 hours ago",
      read: false,
      type: "success"
    },
    {
      id: 2,
      title: "⚡ Your trial ends in 3 days",
      message: "Upgrade to Pro to continue using all premium features",
      timestamp: "5 hours ago",
      read: false,
      type: "warning"
    },
    {
      id: 3,
      title: "💰 Cart recovery campaign recovered $120",
      message: "Your automated email sequence converted 8 abandoned carts",
      timestamp: "1 day ago",
      read: false,
      type: "success"
    },
    {
      id: 4,
      title: "🚀 SEO optimization completed",
      message: "15 product descriptions optimized for better search rankings",
      timestamp: "2 days ago",
      read: true,
      type: "info"
    },
    {
      id: 5,
      title: "📊 Weekly performance report",
      message: "Your store metrics improved by 12% this week",
      timestamp: "3 days ago", 
      read: true,
      type: "info"
    }
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Real-time dashboard data
  const {
    dashboardData,
    formattedStats,
    isLoading,
    isInitialized,
    trackToolAccess,
    logActivity,
    updateUsageStats,
    lastUpdate,
    isTrackingTool,
  } = useDashboard();

  // Skeleton loader with delay
  const showSkeleton = useSkeletonLoader(isLoading, 300);

  // Connection status monitoring
  const { isOnline } = useConnectionStatus();

  // Notification Center Functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      description: "All notifications marked as read",
    });
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    logActivity("notifications_toggled", "User toggled notification center", "dashboard");
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // Handle responsive behavior - close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate stats from real-time data with icons
  const stats = formattedStats.map((stat, index) => {
    const iconMap = {
      TrendingUp: <TrendingUp className="w-6 h-6" />,
      ShoppingCart: <ShoppingCart className="w-6 h-6" />,
      Eye: <Eye className="w-6 h-6" />,
      RotateCcw: <RotateCcw className="w-6 h-6" />,
    };
    return {
      ...stat,
      icon: iconMap[stat.icon as keyof typeof iconMap] || <TrendingUp className="w-6 h-6" />,
    };
  });

  // Quick actions with optimistic UI updates
  const handleToolNavigation = async (toolName: string, displayName: string) => {
    // Optimistic UI update - navigate immediately
    setActiveTab(toolName);
    
    // Track tool access in the background
    trackToolAccess(toolName);
    
    // Log activity
    logActivity(
      "tool_navigation",
      `Navigated to ${displayName}`,
      toolName,
      { timestamp: new Date().toISOString(), optimistic: true }
    );
    
    // Update usage stats based on tool type
    if (toolName === "ai-tools") {
      updateUsageStats("aiGenerationsUsed", 0); // Just tracking access, not usage
    } else if (toolName === "automate") {
      updateUsageStats("automationActionsUsed", 0);
    } else if (toolName === "campaigns") {
      updateUsageStats("campaignsUsed", 0);
    }
  };

  const quickActions = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI Product Generator",
      description: "Generate compelling product descriptions in seconds",
      action: () => handleToolNavigation("ai-tools", "AI Tools"),
      primary: true,
      toolName: "ai-tools",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Automation Tools", 
      description: "Streamline bulk operations and intelligent optimizations",
      action: () => handleToolNavigation("automate", "Automation Tools"),
      primary: false,
      toolName: "automate",
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "AI Campaigns",
      description: "Automated email & SMS growth engine with AI targeting",
      action: () => handleToolNavigation("campaigns", "AI Campaigns"),
      primary: false,
      toolName: "campaigns",
    },
  ];

  // Format real-time activities
  const activities = dashboardData?.activityLogs?.map((log) => {
    const iconMap = {
      "tool_accessed": <Zap className="w-5 h-5 text-primary" />,
      "tool_navigation": <TrendingUp className="w-5 h-5 text-chart-2" />,
      "user_login": <ShoppingCart className="w-5 h-5 text-chart-3" />,
      "generated_product": <Zap className="w-5 h-5 text-primary" />,
      "optimized_seo": <TrendingUp className="w-5 h-5 text-chart-2" />,
      "sent_campaign": <ShoppingCart className="w-5 h-5 text-chart-3" />,
    };

    // Format time ago
    const timeAgo = (dateString: string) => {
      const now = new Date();
      const activityTime = new Date(dateString);
      const diffMs = now.getTime() - activityTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minutes ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    };

    return {
      icon: iconMap[log.action as keyof typeof iconMap] || <Zap className="w-5 h-5 text-primary" />,
      description: log.description,
      time: timeAgo(log.createdAt),
      id: log.id,
    };
  }) || [
    // Fallback activities if no real data
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      description: "Dashboard initialized with real-time data",
      time: "Just now",
      id: "fallback-1",
    },
  ];

  const getPageTitle = () => {
    const titles = {
      overview: { title: "Dashboard", subtitle: "Welcome back! Here's your store overview." },
      "ai-tools": { title: "AI Tools", subtitle: "AI-powered content generation and optimization hub" },
      "automate": { title: "Automation Tools", subtitle: "Streamline your workflow with powerful automation features" },
      campaigns: { title: "AI Email & SMS Growth Engine", subtitle: "Automate customer communications with intelligent campaigns" },
      products: { title: "Products", subtitle: "Manage your product catalog" },
      profile: { title: "Profile", subtitle: "Manage your account and subscription" },
      settings: { title: "Settings", subtitle: "Configure your account and integrations" },
    };
    return titles[activeTab as keyof typeof titles] || titles.overview;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "ai-tools":
        return <AITools />;
      case "automate":
        return <AutomationTools />;
      case "campaigns":
        return <Campaigns />;
      case "products":
        return (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2" data-testid="text-products-title">Product Management</h3>
            <p className="text-muted-foreground mb-6">Manage and optimize your product catalog</p>
            <Button className="gradient-button" data-testid="button-sync-shopify">
              <RotateCcw className="w-4 h-4 mr-2" />
              Sync from Shopify
            </Button>
          </div>
        );
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <GrowthDashboard />;
    }
  };

  const pageTitle = getPageTitle();

  return (
    <div className="min-h-screen flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'ml-0'
      }`}>
        {/* Top Bar */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-muted flex-shrink-0"
                data-testid="button-toggle-sidebar"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate" data-testid="text-page-title">{pageTitle.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground truncate" data-testid="text-page-subtitle">{pageTitle.subtitle}</p>
              </div>
            </div>
            
            {/* Notification Center */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotifications}
                className="relative text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                data-testid="button-notifications"
              >
                <Bell className="w-5 h-5 stroke-2" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 border-0"
                    data-testid="badge-notification-count"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl shadow-2xl border border-slate-700/50 z-50 transition-all duration-300 hover:shadow-cyan-500/30">
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-lg">Notifications</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setNotificationsOpen(false)}
                        className="text-slate-300 hover:text-white hover:bg-white/10 h-8 w-8"
                        data-testid="button-close-notifications"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {unreadCount > 0 && (
                      <p className="text-slate-300 text-sm mt-1">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-300">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-slate-700/30 transition-all duration-300 hover:bg-white/5 ${
                            !notification.read ? 'bg-blue-500/10' : 'opacity-70'
                          }`}
                          data-testid={`notification-${notification.id}`}
                        >
                          <div className="flex items-start justify-between space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-sm mb-1 leading-tight">
                                {notification.title}
                              </h4>
                              <p className="text-slate-300 text-sm mb-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-xs">
                                  {notification.timestamp}
                                </span>
                                <div className="flex items-center space-x-2">
                                  {!notification.read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => markAsRead(notification.id)}
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 text-xs h-6 px-2"
                                      data-testid={`button-mark-read-${notification.id}`}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Mark read
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#C1E8FF] hover:text-white hover:bg-[#C1E8FF]/20 text-xs h-6 px-2"
                                    data-testid={`button-details-${notification.id}`}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {notifications.some(n => !n.read) && (
                    <div className="p-4 border-t border-slate-700/50">
                      <Button
                        onClick={clearAllNotifications}
                        className="w-full bg-[#C1E8FF] hover:bg-[#C1E8FF]/90 text-indigo-900 font-medium transition-all duration-300 hover:scale-105"
                        data-testid="button-clear-all"
                      >
                        Clear All Notifications
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6">
          {showSkeleton && activeTab === "overview" ? (
            <DashboardContentSkeleton />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
}
