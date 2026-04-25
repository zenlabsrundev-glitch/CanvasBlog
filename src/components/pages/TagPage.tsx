import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MOCK_POSTS } from "@/lib/mock-data";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function TagPage() {
  const { tag = "" } = useParams();
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `#${tag} · devnotes`;
  }, [tag]);

  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const filtered = MOCK_POSTS.filter(p => p.tags.includes(tag.toLowerCase()));
      setPosts(filtered);
      setLoading(false);
    }, 500);
  }, [tag]);

  return (
    <>
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
    </>
  );
}
