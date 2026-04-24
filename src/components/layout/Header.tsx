import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bookmark, LayoutDashboard, LogOut, PenSquare, Search, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = q.trim().toLowerCase().replace(/^#/, "");
    if (tag) navigate(`/tag/${encodeURIComponent(tag)}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-mono font-bold text-base tracking-tighter">[ devnotes ]</span>
        </Link>

        <div className="hidden md:block h-4 w-px bg-border" />

        <form onSubmit={submit} className="hidden flex-1 max-w-sm md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="search by tag..."
              className="pl-9 h-9 bg-background border-border font-mono text-xs rounded-sm shadow-key-sm focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          {user && (
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Bookmark className="h-3.5 w-3.5" /> ~/bookmarks
            </NavLink>
          )}
          {isAdmin && (
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex h-9 rounded-sm font-mono text-xs uppercase tracking-wider keycap-primary hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--primary-shadow))] active:translate-y-[3px] active:shadow-none transition-all"
            >
              <Link to="/admin/new">
                <PenSquare className="h-3.5 w-3.5" /> WRITE( )
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="grid h-9 w-9 place-items-center rounded-sm border border-secondary bg-secondary text-secondary-foreground shadow-key-secondary font-mono font-bold text-xs hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--secondary-shadow))] active:translate-y-[3px] active:shadow-none transition-all">
                  {(user.email ?? "?").charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm border-border shadow-card font-mono text-xs">
                <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/bookmarks"><Bookmark className="h-3.5 w-3.5" /> ~/bookmarks</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><LayoutDashboard className="h-3.5 w-3.5" /> ~/admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}><LogOut className="h-3.5 w-3.5" /> sign_out( )</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="h-9 rounded-sm font-mono text-xs uppercase tracking-wider keycap-primary hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--primary-shadow))] active:translate-y-[3px] active:shadow-none transition-all"
            >
              <Link to="/auth"><UserIcon className="h-3.5 w-3.5" /> SIGN_IN</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
