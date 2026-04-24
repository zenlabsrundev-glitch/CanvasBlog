import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/posts";

type Row = {
  id: string; slug: string; title: string; status: string;
  published_at: string | null; updated_at: string; tags: string[];
};

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Admin · devnotes"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate("/"); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("id, slug, title, status, published_at, updated_at, tags")
      .order("updated_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  async function togglePublish(row: Row) {
    const next = row.status === "published" ? "draft" : "published";
    const { error } = await supabase
      .from("posts")
      .update({
        status: next,
        published_at: next === "published" ? new Date().toISOString() : null,
      })
      .eq("id", row.id);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: next === "published" ? "Published" : "Unpublished" });
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Post deleted" });
    setRows((r) => r.filter((x) => x.id !== id));
  }

  return (
    <SiteLayout>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your posts.</p>
          </div>
          <Button asChild>
            <Link to="/admin/new"><Plus className="h-4 w-4" /> New post</Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-medium text-foreground mb-2">No posts yet</p>
            <Button asChild className="mt-3"><Link to="/admin/new">Create your first post</Link></Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li key={r.id} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/post/${r.slug}`} className="font-semibold hover:text-primary truncate">{r.title || "(untitled)"}</Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === "published" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {formatDate(r.updated_at)} · /{r.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => togglePublish(r)}>
                      {r.status === "published" ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Eye className="h-4 w-4" /> Publish</>}
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/edit/${r.id}`}><Edit className="h-4 w-4" /> Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                          <AlertDialogDescription>This permanently removes "{r.title}" and all its comments, likes and bookmarks.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(r.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Admin;
