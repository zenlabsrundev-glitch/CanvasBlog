import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, Trash2 } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { coverBg, formatDate, readingTime } from "@/lib/posts";
import api from "@/lib/api";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  tags: string[];
  coverColor: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  published: boolean;
  liked?: boolean;
  bookmarked?: boolean;
};

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  userId?: string;
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
    async function fetchPost() {
      setLoading(true);
      try {
        const response = await api.get(`/posts/${slug}`);
        const data = response.data;
        setPost(data);
        setLikes(data.likesCount || 0);
        setLiked(!!data.liked);
        setBookmarked(!!data.bookmarked);
        setComments(data.comments || []);
        document.title = `${data.title} · devnotes`;
      } catch (error) {
        console.error("Failed to fetch post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

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
    
    try {
      const response = await api.post(`/interactions/like/${post.id}`);
      const isLiked = response.data.liked;
      setLiked(isLiked);
      setLikes((n) => isLiked ? n + 1 : Math.max(0, n - 1));
      toast({ 
        title: isLiked ? "Post liked" : "Like removed",
        description: isLiked ? "Thanks for your feedback!" : ""
      });
    } catch (error) {
      console.error("Failed to toggle like:", error);
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const toggleBookmark = async () => {
    if (!requireAuth() || !post || !user) return;
    
    try {
      const response = await api.post(`/interactions/bookmark/${post.id}`);
      const isBookmarked = response.data.bookmarked;
      setBookmarked(isBookmarked);
      toast({ 
        title: isBookmarked ? "Saved to bookmarks" : "Removed from bookmarks",
        description: isBookmarked ? "Find it later in your ~/bookmarks" : ""
      });
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth() || !post || !user) return;
    const content = newComment.trim();
    if (!content) return;
    setPosting(true);
    
    try {
      const response = await api.post(`/comments/${post.id}`, {
        authorName: user.name || user.email,
        content
      });
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
      toast({ title: "Comment posted" });
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast({ title: "Failed to post comment", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const deleteComment = async (id: string) => {
    // Note: Delete comment endpoint not provided by user, simulating local state
    setComments((c) => c.filter((x) => x.id !== id));
    toast({ title: "Comment deleted (local)" });
  };

  const heroBg = useMemo(() => coverBg(post?.coverColor), [post?.coverColor]);

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
          {post.tags?.map((t) => (
            <Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag-chip">#{t}</Link>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{formatDate(post.createdAt)}</span>
          <span>·</span>
          <span>{readingTime(post.content)} min read</span>
          {!post.published && (
            <span className="ml-2 inline-flex items-center rounded-full bg-warning/15 text-warning px-2 py-0.5 text-xs font-medium">Draft</span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button 
            variant={liked ? "default" : "outline"} 
            size="sm" 
            onClick={toggleLike} 
            className={liked ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} /> {likes} {likes === 1 ? "like" : "likes"}
          </Button>
          <Button 
            variant={bookmarked ? "default" : "outline"} 
            size="sm" 
            onClick={toggleBookmark}
            className={bookmarked ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} /> {bookmarked ? "Saved" : "Save"}
          </Button>
          <a href="#comments" className="ml-auto text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {comments.length}
          </a>
        </div>

        <div className="mt-8">
          <MarkdownRenderer source={post.content} />
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
                        {(c.authorName ?? "U").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium leading-tight">{c.authorName ?? "Reader"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" onClick={() => deleteComment(c.id)} aria-label="Delete comment">
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{c.content}</p>
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
