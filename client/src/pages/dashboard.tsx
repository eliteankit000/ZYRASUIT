import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardContentSkeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/dashboard/sidebar";
import AITools from "@/components/dashboard/ai-tools";
import AutomationTools from "@/components/dashboard/automation-tools";
import Campaigns from "@/components/dashboard/campaigns";
import GrowthDashboard from "@/components/dashboard/growth-dashboard";
import Profile from "@/components/dashboard/profile";
import { useAuth } from "@/lib/auth";
import { useDashboard, useSkeletonLoader, useConnectionStatus } from "@/hooks/useDashboard";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Zap, TrendingUp, ShoppingCart, Eye, RotateCcw, Plus, Bell, Menu, Wifi, WifiOff } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time dashboard data
  const {
    dashboardData,
    formattedStats,
    isLoading,
    isInitialized,
    trackToolAccess,
    logActivity,
    updateUsageStats,
    refreshDashboard,
    lastUpdate,
    isTrackingTool,
    isRefreshing,
  } = useDashboard();

  // Skeleton loader with delay
  const showSkeleton = useSkeletonLoader(isLoading, 300);

  // Connection status monitoring
  const { isOnline } = useConnectionStatus();

  // Optimize All Products mutation with debouncing
  const optimizeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/products/optimize-all");
      return response.json();
    },
    onSuccess: (data: any) => {
      // Show success toast with details
      const { optimizedCount, duplicatesRemoved, details } = data;
      let message = `✅ All products optimized successfully! `;
      if (optimizedCount > 0) {
        message += `${optimizedCount} products processed`;
        if (duplicatesRemoved > 0) {
          message += `, ${duplicatesRemoved} duplicates removed`;
        }
        message += `.`;
      }
      
      toast({
        title: "Optimization Complete!",
        description: message,
        duration: 5000,
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      // Update usage stats optimistically
      updateUsageStats("productsOptimized", optimizedCount);
      logActivity("optimize_all_completed", `Optimized ${optimizedCount} products successfully`, "dashboard");
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Optimization Failed",
        description: error.message || "Failed to optimize products. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      logActivity("optimize_all_failed", "Product optimization failed", "dashboard");
    }
  });

  // Debounced optimize function to prevent multiple clicks
  const [lastOptimizeTime, setLastOptimizeTime] = useState(0);
  const handleOptimizeAll = useCallback(() => {
    const now = Date.now();
    const minDelay = 2000; // 2 second debounce
    
    if (now - lastOptimizeTime < minDelay) {
      toast({
        title: "Please Wait",
        description: "Optimization is in progress. Please wait a moment.",
        duration: 3000,
      });
      return;
    }
    
    setLastOptimizeTime(now);
    logActivity("optimize_all_clicked", "User clicked Optimize All button", "dashboard");
    optimizeAllMutation.mutate();
  }, [lastOptimizeTime, logActivity, optimizeAllMutation, toast]);

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
        return (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2" data-testid="text-settings-title">Settings & Configuration</h3>
            <p className="text-muted-foreground mb-6">Configure your account and integrations</p>
            <Button className="gradient-button" data-testid="button-connect-shopify">
              <Plus className="w-4 h-4 mr-2" />
              Connect Shopify
            </Button>
          </div>
        );
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
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
              {/* Connection Status Indicator */}
              <div className="flex items-center mr-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-destructive" />
                )}
                {isInitialized && (
                  <span className="ml-1 text-xs text-muted-foreground hidden lg:inline">
                    Last sync: {new Date(lastUpdate).toLocaleTimeString()}
                  </span>
                )}
              </div>

              <Button 
                id="optimizeAllBtn"
                className="gradient-button hidden sm:flex text-sm lg:text-base px-3 sm:px-4 transition-all duration-200 hover:scale-105 active:scale-95" 
                data-testid="button-optimize-all"
                onClick={handleOptimizeAll}
                disabled={isTrackingTool || optimizeAllMutation.isPending}
              >
                <Zap className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${
                  optimizeAllMutation.isPending ? 'animate-spin' : ''
                }`} />
                <span className="hidden md:inline">
                  {optimizeAllMutation.isPending ? '⚡ Optimizing…' : '⚡ Optimize All'}
                </span>
                <span className="md:hidden">
                  {optimizeAllMutation.isPending ? '⚡ ...' : '⚡ Optimize'}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="hidden md:flex text-sm lg:text-base px-3 sm:px-4" 
                data-testid="button-add-product"
                onClick={() => {
                  logActivity("add_product_clicked", "User clicked Add Product button", "dashboard");
                  setLocation("/products");
                }}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Add Product
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative" 
                data-testid="button-notifications"
                onClick={() => logActivity("notifications_opened", "User opened notifications", "dashboard")}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-destructive rounded-full"></span>
              </Button>
              
              <Button 
                id="refreshBtn"
                variant="outline" 
                size="sm"
                onClick={refreshDashboard}
                disabled={isRefreshing}
                className="text-xs transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-accent hover:border-primary"
                data-testid="button-refresh-dashboard"
              >
                <RotateCcw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing…' : '🔄 Refresh'}
              </Button>
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
