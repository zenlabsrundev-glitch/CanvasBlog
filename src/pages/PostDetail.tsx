import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { coverBg, formatDate, readingTime } from "@/lib/posts";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  tags: string[];
  cover_color: string;
  published_at: string | null;
  status: string;
};
type Comment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profile?: { display_name: string | null } | null;
};

const PostDetail = () => {
  const { slug } = useParams();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("id, slug, title, excerpt, body_md, tags, cover_color, published_at, status")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) {
        setLoading(false);
        return;
      }
      setPost(data as Post);
      document.title = `${data.title} · devnotes`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta && data.excerpt) meta.setAttribute("content", data.excerpt);

      const [{ data: lr }, { data: cr }] = await Promise.all([
        supabase.from("likes").select("user_id").eq("post_id", data.id),
        supabase
          .from("comments")
          .select("id, body, created_at, user_id")
          .eq("post_id", data.id)
          .order("created_at", { ascending: false }),
      ]);
      setLikes(lr?.length ?? 0);
      setLiked(!!user && !!lr?.some((r) => r.user_id === user.id));

      // load profiles for comments
      const userIds = Array.from(new Set((cr ?? []).map((c) => c.user_id)));
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
        : { data: [] as any[] };
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      setComments(((cr ?? []) as Comment[]).map((c) => ({ ...c, profile: profMap.get(c.user_id) ?? null })));

      if (user) {
        const { data: bm } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("post_id", data.id)
          .eq("user_id", user.id)
          .maybeSingle();
        setBookmarked(!!bm);
      } else {
        setBookmarked(false);
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const requireAuth = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Create an account to engage with posts." });
      navigate("/auth");
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth() || !post || !user) return;
    if (liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
    } else {
      const { error } = await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
      if (!error) {
        setLiked(true);
        setLikes((n) => n + 1);
      }
    }
  };

  const toggleBookmark = async () => {
    if (!requireAuth() || !post || !user) return;
    if (bookmarked) {
      await supabase.from("bookmarks").delete().eq("post_id", post.id).eq("user_id", user.id);
      setBookmarked(false);
    } else {
      const { error } = await supabase.from("bookmarks").insert({ post_id: post.id, user_id: user.id });
      if (!error) setBookmarked(true);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !post || !user) return;
    const body = newComment.trim();
    if (!body) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, user_id: user.id, body })
      .select("id, body, created_at, user_id")
      .single();
    setPosting(false);
    if (error) {
      toast({ title: "Couldn't post comment", description: error.message, variant: "destructive" });
      return;
    }
    const { data: prof } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    setComments((prev) => [{ ...(data as Comment), profile: prof ?? null }, ...prev]);
    setNewComment("");
  };

  const deleteComment = async (id: string) => {
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      setComments(prev);
      toast({ title: "Couldn't delete", description: error.message, variant: "destructive" });
    }
  };

  const heroBg = useMemo(() => coverBg(post?.cover_color), [post?.cover_color]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="container py-10 max-w-3xl space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-6">It may have been unpublished or moved.</p>
          <Button asChild><Link to="/">Back home</Link></Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container max-w-3xl py-8 md:py-10">
        <div className={`h-44 md:h-56 rounded-2xl ${heroBg} mb-6 shadow-elegant`} />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((t) => (
            <Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag-chip">#{t}</Link>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{formatDate(post.published_at)}</span>
          <span>·</span>
          <span>{readingTime(post.body_md)} min read</span>
          {post.status === "draft" && (
            <span className="ml-2 inline-flex items-center rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-medium">Draft</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button variant={liked ? "default" : "outline"} size="sm" onClick={toggleLike} className={liked ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}>
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {likes} {likes === 1 ? "like" : "likes"}
          </Button>
          <Button variant={bookmarked ? "default" : "outline"} size="sm" onClick={toggleBookmark}>
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /> {bookmarked ? "Saved" : "Save"}
          </Button>
          <a href="#comments" className="ml-auto text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {comments.length}
          </a>
        </div>

        <div className="mt-8">
          <MarkdownRenderer source={post.body_md} />
        </div>

        {/* Comments */}
        <section id="comments" className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

          {user ? (
            <form onSubmit={submitComment} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <Button type="submit" disabled={posting || !newComment.trim()}>
                  {posting ? "Posting…" : "Post comment"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="mb-6 rounded-lg border border-border p-4 bg-muted/40 text-sm">
              <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link> to join the conversation.
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet — be the first!</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="rounded-xl border border-border p-4 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {(c.profile?.display_name ?? "U").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium leading-tight">{c.profile?.display_name ?? "Reader"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    {(user?.id === c.user_id || isAdmin) && (
                      <Button variant="ghost" size="icon" onClick={() => deleteComment(c.id)} aria-label="Delete comment">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </SiteLayout>
  );
};

export default PostDetail;
