import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_POSTS } from "@/lib/mock-data";

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
    
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // In demo, just show all posts as bookmarked for the logged in user
      setPosts(MOCK_POSTS);
      setLoading(false);
    }, 500);
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
