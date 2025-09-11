import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Zap, 
  Home, 
  Search, 
  BarChart3, 
  Mail, 
  Package, 
  Settings, 
  LogOut,
  User
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
}

export default function Sidebar({ activeTab, onTabChange, user }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({ title: "Logged out", description: "Successfully logged out" });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const navItems = [
    { id: "overview", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "ai-generator", label: "AI Generator", icon: <Zap className="w-5 h-5" /> },
    { id: "seo-tools", label: "SEO Tools", icon: <Search className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "campaigns", label: "Campaigns", icon: <Mail className="w-5 h-5" /> },
    { id: "products", label: "Products", icon: <Package className="w-5 h-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed left-0 top-0 w-64 h-full sidebar-gradient border-r border-border z-40">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8" data-testid="sidebar-logo">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">Zyra</span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              variant="ghost"
              className={`w-full justify-start px-4 py-3 h-auto ${
                activeTab === item.id
                  ? "bg-primary/20 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              data-testid={`nav-${item.id}`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
        <div className="flex items-center space-x-3" data-testid="user-profile">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium" data-testid="text-user-name">{user?.fullName || "User"}</div>
            <div className="text-xs text-muted-foreground" data-testid="text-user-plan">{user?.plan || "Free"} Plan</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
