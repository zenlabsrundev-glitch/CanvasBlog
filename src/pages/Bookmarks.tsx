import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Bookmarks = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = "Bookmarks · devnotes"; }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      setLoading(true);
      const { data: bm } = await supabase
        .from("bookmarks")
        .select("post_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const ids = (bm ?? []).map((b) => b.post_id);
      if (ids.length === 0) { setPosts([]); setLoading(false); return; }
      const { data: postRows } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, tags, cover_color, body_md, published_at")
        .in("id", ids);
      const [{ data: lr }, { data: cr }] = await Promise.all([
        supabase.from("likes").select("post_id").in("post_id", ids),
        supabase.from("comments").select("post_id").in("post_id", ids),
      ]);
      const counts = (rows: { post_id: string }[] | null) => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => m.set(r.post_id, (m.get(r.post_id) ?? 0) + 1));
        return m;
      };
      const lc = counts(lr); const cc = counts(cr);
      const order = new Map(ids.map((id, i) => [id, i]));
      const enriched = (postRows ?? [])
        .map((p) => ({ ...p, likes: lc.get(p.id) ?? 0, comments: cc.get(p.id) ?? 0 }))
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      setPosts(enriched);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero border-b border-border">
        <div className="container py-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Your bookmarks</h1>
          <p className="text-muted-foreground mt-1">Posts you've saved for later.</p>
        </div>
      </section>
      <div className="container py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="font-medium text-foreground mb-2">No bookmarks yet</p>
            <p>Hit the <span className="font-medium text-foreground">Save</span> button on any post to keep it here.</p>
            <Link to="/" className="text-primary font-medium hover:underline mt-3 inline-block">Browse posts →</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </div>
    </SiteLayout>
  );
};

export default Bookmarks;
