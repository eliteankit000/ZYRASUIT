import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/dashboard/sidebar";
import AIGenerator from "@/components/dashboard/ai-generator";
import SEOTools from "@/components/dashboard/seo-tools";
import Analytics from "@/components/dashboard/analytics";
import { useAuth } from "@/lib/auth";
import { Zap, TrendingUp, ShoppingCart, Eye, RotateCcw, Plus, Bell, Menu } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const stats = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Total Revenue",
      value: "$24,357",
      change: "+12.5%",
      positive: true,
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Orders",
      value: "1,247",
      change: "+8.2%",
      positive: true,
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Conversion Rate",
      value: "3.2%",
      change: "-2.1%",
      positive: false,
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: "Cart Recovery",
      value: "85%",
      change: "+15.3%",
      positive: true,
    },
  ];

  const quickActions = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "AI Product Generator",
      description: "Generate compelling product descriptions in seconds",
      action: () => setActiveTab("ai-generator"),
      primary: true,
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "SEO Optimization",
      description: "Optimize titles and meta descriptions for better rankings",
      action: () => setActiveTab("seo-tools"),
      primary: false,
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Email Campaigns",
      description: "Create and send targeted email campaigns",
      action: () => setActiveTab("campaigns"),
      primary: false,
    },
  ];

  const activities = [
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      description: 'Generated product description for "Wireless Headphones"',
      time: "2 minutes ago",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-chart-2" />,
      description: "Optimized SEO for 15 products",
      time: "1 hour ago",
    },
    {
      icon: <ShoppingCart className="w-5 h-5 text-chart-3" />,
      description: "Sent cart recovery email campaign",
      time: "3 hours ago",
    },
  ];

  const getPageTitle = () => {
    const titles = {
      overview: { title: "Dashboard", subtitle: "Welcome back! Here's your store overview." },
      "ai-generator": { title: "AI Generator", subtitle: "Create compelling product descriptions with AI" },
      "seo-tools": { title: "SEO Tools", subtitle: "Optimize your products for search engines" },
      analytics: { title: "Analytics", subtitle: "Track your optimization performance" },
      campaigns: { title: "Campaigns", subtitle: "Manage your email and SMS campaigns" },
      products: { title: "Products", subtitle: "Manage your product catalog" },
      settings: { title: "Settings", subtitle: "Configure your account and integrations" },
    };
    return titles[activeTab as keyof typeof titles] || titles.overview;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "ai-generator":
        return <AIGenerator />;
      case "seo-tools":
        return <SEOTools />;
      case "analytics":
        return <Analytics />;
      case "campaigns":
        return (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2" data-testid="text-campaigns-title">Email & SMS Campaigns</h3>
            <p className="text-muted-foreground mb-6">Create and manage your marketing campaigns</p>
            <Button className="gradient-button" data-testid="button-create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        );
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
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="stat-card border-0" data-testid={`card-stat-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                        {stat.icon}
                      </div>
                      <Badge 
                        variant={stat.positive ? "default" : "destructive"}
                        className={stat.positive ? "bg-green-400/10 text-green-400" : "bg-orange-400/10 text-orange-400"}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold mb-1" data-testid={`text-stat-value-${index}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-stat-title-${index}`}>{stat.title}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="gradient-card border-0" data-testid={`card-quick-action-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-3 text-primary">
                        {action.icon}
                      </div>
                      <h3 className="text-lg font-semibold" data-testid={`text-quick-action-title-${index}`}>{action.title}</h3>
                    </div>
                    <p className="text-muted-foreground mb-4" data-testid={`text-quick-action-description-${index}`}>{action.description}</p>
                    <Button
                      onClick={action.action}
                      className={`w-full ${action.primary ? 'gradient-button' : 'border border-border hover:bg-muted'}`}
                      variant={action.primary ? "default" : "outline"}
                      data-testid={`button-quick-action-${index}`}
                    >
                      {action.primary ? "Generate Now" : action.title.includes("SEO") ? "Optimize SEO" : "Create Campaign"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="gradient-card border-0">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6" data-testid="text-recent-activity-title">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-center p-4 bg-muted/30 rounded-lg" data-testid={`card-activity-${index}`}>
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mr-4">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium" data-testid={`text-activity-description-${index}`}>{activity.description}</div>
                        <div className="text-sm text-muted-foreground" data-testid={`text-activity-time-${index}`}>{activity.time}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:underline" data-testid={`button-activity-view-${index}`}>
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
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
        <header className="bg-card/50 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hover:bg-muted"
                data-testid="button-toggle-sidebar"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" data-testid="text-page-title">{pageTitle.title}</h1>
                <p className="text-muted-foreground" data-testid="text-page-subtitle">{pageTitle.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="gradient-button" data-testid="button-optimize-all">
                <Zap className="w-4 h-4 mr-2" />
                Optimize All
              </Button>
              <Button variant="outline" data-testid="button-add-product">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
              <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
