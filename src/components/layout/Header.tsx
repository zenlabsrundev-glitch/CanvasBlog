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
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="container flex h-16 items-center gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant">
            ‹/›
          </span>
          <span>devnotes</span>
        </Link>

        <form onSubmit={submit} className="ml-2 hidden flex-1 max-w-md md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by tag (e.g. react)"
              className="pl-9 bg-muted/50 border-transparent focus-visible:bg-background"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1">
          {user && (
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              <Bookmark className="h-4 w-4" /> Bookmarks
            </NavLink>
          )}
          {isAdmin && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/admin/new">
                <PenSquare className="h-4 w-4" /> Write
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {(user.email ?? "?").charAt(0).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/bookmarks"><Bookmark className="h-4 w-4" /> Bookmarks</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin"><LayoutDashboard className="h-4 w-4" /> Admin dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4" /> Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth"><UserIcon className="h-4 w-4" /> Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
