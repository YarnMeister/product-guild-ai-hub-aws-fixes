import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth, getRankInfo } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  GraduationCap,
  TrendingUp,
  Menu,
  LogOut,
  User,
  FileEdit,
} from "lucide-react";
import { useState } from "react";
import reaLogo from "@/assets/rea-logo.png";
import { getModule, getAvailableModules } from "@/data/modules";

// Dynamic nav items based on module context
function getNavItems(moduleId?: string) {
  if (!moduleId) {
    return [];
  }
  return [
    { label: "Overview", href: `/module/${moduleId}`, icon: LayoutDashboard },
    { label: "Explore", href: `/module/${moduleId}/explore`, icon: GraduationCap },
    { label: "Progress", href: `/module/${moduleId}/progress`, icon: TrendingUp },
  ];
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Extract moduleId from URL
  const moduleIdMatch = location.pathname.match(/^\/module\/([^/]+)/);
  const moduleId = moduleIdMatch ? moduleIdMatch[1] : undefined;
  const module = moduleId ? getModule(moduleId) : null;

  const navItems = getNavItems(moduleId);
  const rankInfo = user ? getRankInfo(user.currentRank) : null;
  const progressModuleId = moduleId ?? getAvailableModules()[0]?.id;
  const progressUrl = progressModuleId ? `/module/${progressModuleId}/progress` : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Primary Navigation */}
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src={reaLogo} 
            alt="REA Logo" 
            className="h-9 w-9 rounded-lg transition-transform group-hover:scale-105"
          />
          <span className="font-semibold text-lg hidden sm:block">
            AI Hub
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Menu / Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 h-auto py-2 px-3 hover:bg-muted"
                >
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {rankInfo?.name}
                    </span>
                  </div>
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-medium text-primary">
                        {rankInfo?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Rank {user.currentRank}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={progressUrl} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>My Progress</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/content-studio" className="flex items-center gap-2">
                    <FileEdit className="h-4 w-4" />
                    <span>Content Studio</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

    </header>
  );
}
