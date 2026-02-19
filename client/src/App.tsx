import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { Loader2 } from "lucide-react";

// Pages
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import MenuManagement from "@/pages/admin/Menu";
import StaffManagement from "@/pages/admin/Staff";
import POS from "@/pages/admin/POS";
import KitchenDisplay from "@/pages/kitchen/KitchenDisplay";
import NotFound from "@/pages/not-found";

// Protected Route Wrapper
function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: React.ComponentType, 
  allowedRoles: ('admin' | 'staff')[] 
}) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    return <Redirect to="/login" />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return <Redirect to={userProfile.role === 'admin' ? '/admin' : '/staff/kitchen'} />;
  }

  return (
    <>
      <Navigation />
      <main className="bg-background min-h-[calc(100vh-64px)]">
        <Component />
      </main>
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/menu">
        <ProtectedRoute component={MenuManagement} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/staff">
        <ProtectedRoute component={StaffManagement} allowedRoles={['admin']} />
      </Route>
      <Route path="/admin/pos">
        <ProtectedRoute component={POS} allowedRoles={['admin']} />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff/kitchen">
        {/* Admin can also view kitchen */}
        <ProtectedRoute component={KitchenDisplay} allowedRoles={['staff', 'admin']} />
      </Route>

      {/* Default Redirects */}
      <Route path="/">
        {() => {
          const { userProfile, loading } = useAuth();
          if (loading) return null;
          if (!userProfile) return <Redirect to="/login" />;
          return <Redirect to={userProfile.role === 'admin' ? '/admin' : '/staff/kitchen'} />;
        }}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
