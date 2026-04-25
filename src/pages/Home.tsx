import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Terminal } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { PostCard, type PostCardData } from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

import { MOCK_POSTS } from "@/lib/mock-data";

const Home = () => {
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    document.title = "devnotes — A student tech blog about code, learning & ideas";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Markdown-powered student tech blog: tutorials, notes and code snippets on web dev, AI, and more.");
  }, []);

  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      setPosts(MOCK_POSTS);
      const tagSet = new Set<string>();
      MOCK_POSTS.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
      setTags(Array.from(tagSet).sort().slice(0, 12));
      setLoading(false);
    }, 500);
  }, []);

  const visiblePosts = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  const featured = posts[0];
  const trendingTag = tags[0];

  return (
    <SiteLayout>
      <div className="container pt-10 md:pt-14">
        {/* Hero — modular grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main hero card */}
          <div className="lg:col-span-8 bg-card border border-border rounded-sm p-8 md:p-12 shadow-card relative overflow-hidden">
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-5 items-start">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 border border-primary/20 rounded-sm uppercase tracking-widest">
                <span className="size-1.5 bg-primary rounded-full animate-pulse" />
                System Online
              </div>
              <h1 className="font-display font-bold text-4xl md:text-6xl leading-[1.05] tracking-tight text-balance max-w-[16ch]">
                Documenting the compile cycle.
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-[50ch] text-pretty leading-relaxed">
                Raw markdown dispatches from the frontlines of student engineering. No fluff, just the logic that worked (eventually).
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {isAdmin && (
                  <Button
                    asChild
                    className="h-11 px-5 rounded-sm font-mono text-sm uppercase tracking-wider keycap-primary hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--primary-shadow))] active:translate-y-[3px] active:shadow-none transition-all"
                  >
                    <Link to="/admin/new">WRITE_NEW_POST( )</Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="h-11 px-5 rounded-sm font-mono text-sm uppercase tracking-wider bg-card border-border text-foreground shadow-[0_3px_0_0_hsl(var(--border))] hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--border))] active:translate-y-[3px] active:shadow-none transition-all"
                >
                  <a href="#latest">BROWSE_FEED <ArrowRight className="h-4 w-4 ml-1" /></a>
                </Button>
              </div>
            </div>
          </div>

          {/* Side stack */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Trending block */}
            <div className="flex-1 keycap-secondary rounded-sm p-6 flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-80 mb-3">Trending Variable</span>
              {featured ? (
                <Link to={`/post/${featured.slug}`} className="block group">
                  <h3 className="font-display font-bold text-xl leading-tight mb-2 group-hover:underline decoration-2 underline-offset-4">
                    {featured.title}
                  </h3>
                  {featured.excerpt && (
                    <p className="text-sm opacity-80 line-clamp-2">{featured.excerpt}</p>
                  )}
                  <p className="font-mono text-xs mt-auto pt-4 opacity-90">read post →</p>
                </Link>
              ) : (
                <div className="opacity-80">
                  <h3 className="font-display font-bold text-xl leading-tight mb-2">No posts yet</h3>
                  <p className="text-sm">{isAdmin ? "Publish the first one." : "Check back soon."}</p>
                </div>
              )}
            </div>

            {/* Output log */}
            <div className="bg-card border border-border rounded-sm p-5 shadow-card">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                <Terminal className="h-3 w-3" /> Output Log
              </span>
              <div className="font-mono text-xs leading-relaxed">
                <div className="text-muted-foreground">$ git log --oneline -2</div>
                <div className="text-foreground truncate">{posts.length} post{posts.length === 1 ? "" : "s"} indexed</div>
                <div className="text-secondary">✓ Feed deployed.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter chips */}
        {tags.length > 0 && (
          <section className="mt-10 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Filter_By:</span>
            <button
              onClick={() => setActiveTag(null)}
              className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all ${
                activeTag === null
                  ? "border-primary bg-primary/5 text-primary shadow-[0_2px_0_0_hsl(var(--primary))]"
                  : "border-border bg-card text-foreground shadow-[0_3px_0_0_hsl(var(--border))] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_hsl(var(--border))] active:translate-y-[2px] active:shadow-none"
              }`}
            >
              All
            </button>
            {tags.map((t) => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveTag(active ? null : t)}
                  className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 border rounded-sm transition-all ${
                    active
                      ? "border-primary bg-primary/5 text-primary shadow-[0_2px_0_0_hsl(var(--primary))]"
                      : "border-border bg-card text-foreground shadow-[0_3px_0_0_hsl(var(--border))] hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_hsl(var(--border))] active:translate-y-[2px] active:shadow-none"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </section>
        )}

        {/* Latest posts */}
        <section id="latest" className="py-10 md:py-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {activeTag ? (
                <>Posts tagged <span className="text-primary font-mono">#{activeTag}</span></>
              ) : (
                "Latest Dispatches"
              )}
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              [ {visiblePosts.length} {visiblePosts.length === 1 ? "entry" : "entries"} ]
            </span>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-sm" />
              ))}
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-sm p-12 text-center">
              <p className="font-display text-xl font-bold mb-2">
                {activeTag ? `No posts tagged #${activeTag}` : "No posts yet"}
              </p>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-wider mb-4">
                {activeTag ? "Try a different tag" : "Once published, articles will show up here"}
              </p>
              {isAdmin && !activeTag && (
                <Button
                  asChild
                  className="h-10 rounded-sm font-mono text-xs uppercase tracking-wider keycap-primary hover:translate-y-[1px] hover:shadow-[0_2px_0_0_hsl(var(--primary-shadow))] active:translate-y-[3px] active:shadow-none transition-all"
                >
                  <Link to="/admin/new">Write the first one</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visiblePosts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </div>
    </SiteLayout>
  );
};

export default Home;
