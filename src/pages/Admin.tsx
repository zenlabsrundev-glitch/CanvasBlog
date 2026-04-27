import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";

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
import api from "@/lib/api";

type Post = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
};

const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Admin · devnotes"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate("/"); return; }
    load();
  }, [isAdmin, authLoading]);

  async function load() {
    setLoading(true);
    try {
      const response = await api.get("/posts");
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to load posts:", error);
      toast({ title: "Failed to load posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function togglePublish(post: Post) {
    try {
      const nextStatus = !post.published;
      await api.put(`/posts/${post.id}`, {
        ...post,
        published: nextStatus
      });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: nextStatus } : p));
      toast({ title: nextStatus ? "Published" : "Unpublished" });
    } catch (error) {
      console.error("Failed to update post status:", error);
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function remove(id: string) {
    try {
      // User didn't provide DELETE endpoint, assuming /posts/:id
      await api.delete(`/posts/${id}`);
      setPosts((p) => p.filter((x) => x.id !== id));
      toast({ title: "Post deleted" });
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast({ title: "Delete failed", variant: "destructive" });
    }
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
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-medium text-foreground mb-2">No posts yet</p>
            <Button asChild className="mt-3"><Link to="/admin/new">Create your first post</Link></Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <ul className="divide-y divide-border">
              {posts.map((p) => (
                <li key={p.id} className="p-4 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/post/${p.slug}`} className="font-semibold hover:text-primary truncate">{p.title || "(untitled)"}</Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.published ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                      }`}>
                        {p.published ? "published" : "draft"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated {formatDate(p.updatedAt)} · /{p.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => togglePublish(p)}>
                      {p.published ? <><EyeOff className="h-4 w-4" /> Unpublish</> : <><Eye className="h-4 w-4" /> Publish</>}
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/edit/${p.id}`}><Edit className="h-4 w-4" /> Edit</Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                          <AlertDialogDescription>This permanently removes "{p.title}" and all its comments, likes and bookmarks.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
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
