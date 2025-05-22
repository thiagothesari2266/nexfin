import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountProvider } from "@/contexts/AccountContext";
import Dashboard from "@/pages/Dashboard";
import AccountSelector from "@/pages/AccountSelector";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AccountSelector} />
      <Route path="/dashboard" component={Dashboard} />
      <Route>
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">404 - Página não encontrada</h1>
            <p className="text-muted-foreground">A página que você está procurando não existe.</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccountProvider>
          <Toaster />
          <Router />
        </AccountProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
