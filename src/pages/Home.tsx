import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Home = () => {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    document.title = "devnotes — A student tech blog about code, learning & ideas";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Markdown-powered student tech blog: tutorials, notes and code snippets on web dev, AI, and more.");
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: postRows } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, tags, cover_color, body_md, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(30);

      const ids = (postRows ?? []).map((p) => p.id);
      const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
        supabase.from("likes").select("post_id").in("post_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
        supabase.from("comments").select("post_id").in("post_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
      ]);

      const counts = (rows: { post_id: string }[] | null) => {
        const m = new Map<string, number>();
        (rows ?? []).forEach((r) => m.set(r.post_id, (m.get(r.post_id) ?? 0) + 1));
        return m;
      };
      const lc = counts(likeRows);
      const cc = counts(commentRows);

      const enriched: PostCardData[] = (postRows ?? []).map((p) => ({
        ...p,
        likes: lc.get(p.id) ?? 0,
        comments: cc.get(p.id) ?? 0,
      }));
      setPosts(enriched);

      const tagSet = new Set<string>();
      enriched.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
      setTags(Array.from(tagSet).sort().slice(0, 14));
      setLoading(false);
    })();
  }, []);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-hero border-b border-border">
        <div className="container py-14 md:py-20">
          <p className="text-sm font-medium text-primary mb-3">📝 Student tech blog</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl">
            Notes from a developer in progress.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            Tutorials, deep-dives and code snippets on web dev, algorithms, and the things I learn along the way — written in Markdown, served fresh.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {isAdmin && (
              <Button asChild>
                <Link to="/admin/new">Write a new post</Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <a href="#latest">Browse the blog</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Tags */}
      {tags.length > 0 && (
        <section className="border-b border-border">
          <div className="container py-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-1">Topics:</span>
            {tags.map((t) => (
              <Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag-chip">#{t}</Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest posts */}
      <section id="latest" className="container py-10">
        <h2 className="text-2xl font-bold mb-6">Latest posts</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium text-foreground mb-2">No posts yet</p>
            <p>Once the author publishes their first article, it'll show up here.</p>
            {isAdmin && (
              <Button asChild className="mt-4"><Link to="/admin/new">Write the first one</Link></Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        )}
      </section>
    </SiteLayout>
  );
};

export default Home;
