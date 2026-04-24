import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Tag = () => {
  const { tag = "" } = useParams();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `#${tag} · devnotes`;
  }, [tag]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: postRows } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, tags, cover_color, body_md, published_at")
        .eq("status", "published")
        .contains("tags", [tag])
        .order("published_at", { ascending: false });
      const ids = (postRows ?? []).map((p) => p.id);
      const [{ data: lr }, { data: cr }] = await Promise.all([
        supabase.from("likes").select("post_id").in("post_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("comments").select("post_id").in("post_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
      ]);
      const counts = (rows: { post_id: string }[] | null) => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => m.set(r.post_id, (m.get(r.post_id) ?? 0) + 1));
        return m;
      };
      const lc = counts(lr);
      const cc = counts(cr);
      setPosts((postRows ?? []).map((p) => ({ ...p, likes: lc.get(p.id) ?? 0, comments: cc.get(p.id) ?? 0 })));
      setLoading(false);
    })();
  }, [tag]);

  return (
    <SiteLayout>
      <section className="bg-gradient-hero border-b border-border">
        <div className="container py-10">
          <p className="text-sm text-muted-foreground">Tag</p>
          <h1 className="text-3xl font-extrabold tracking-tight">#{tag}</h1>
          <p className="text-muted-foreground mt-1">{loading ? "…" : `${posts.length} post${posts.length === 1 ? "" : "s"}`}</p>
        </div>
      </section>
      <div className="container py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="font-medium mb-2">Nothing tagged #{tag} yet.</p>
            <Button asChild variant="outline"><Link to="/">Back home</Link></Button>
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

export default Tag;
