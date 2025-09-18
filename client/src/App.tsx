import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Profile from "@/pages/profile";
import Billing from "@/pages/billing";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/lib/auth";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : Landing} />
      <Route path="/auth/:mode?" component={Auth} />
      <Route path="/dashboard" component={user ? Dashboard : () => { window.location.href = "/auth/login"; return null; }} />
      <Route path="/products" component={user ? Products : () => { window.location.href = "/auth/login"; return null; }} />
      <Route path="/profile" component={user ? Profile : () => { window.location.href = "/auth/login"; return null; }} />
      <Route path="/billing" component={user ? Billing : () => { window.location.href = "/auth/login"; return null; }} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
