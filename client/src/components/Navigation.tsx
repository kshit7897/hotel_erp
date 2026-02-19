import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  LogOut, 
  ChefHat 
} from "lucide-react";

export function Navigation() {
  const { userProfile, logout, isAdmin } = useAuth();
  const [location] = useLocation();

  if (!userProfile) return null;

  const isActive = (path: string) => location === path;

  return (
    <div className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <ChefHat className="h-8 w-8" />
          <span className="hidden md:inline">GourmetOS</span>
        </div>

        <nav className="flex items-center gap-1 md:gap-2">
          {isAdmin ? (
            <>
              <Link href="/admin">
                <Button 
                  variant={isActive("/admin") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Overview</span>
                </Button>
              </Link>
              <Link href="/admin/pos">
                <Button 
                  variant={isActive("/admin/pos") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden md:inline">POS</span>
                </Button>
              </Link>
              <Link href="/admin/menu">
                <Button 
                  variant={isActive("/admin/menu") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span className="hidden md:inline">Menu</span>
                </Button>
              </Link>
              <Link href="/admin/staff">
                <Button 
                  variant={isActive("/admin/staff") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden md:inline">Staff</span>
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/staff/kitchen">
              <Button 
                variant={isActive("/staff/kitchen") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <UtensilsCrossed className="h-4 w-4" />
                <span className="hidden md:inline">Kitchen</span>
              </Button>
            </Link>
          )}
          
          <div className="w-px h-6 bg-border mx-1 md:mx-2" />
          
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
