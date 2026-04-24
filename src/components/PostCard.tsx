import { Link } from "react-router-dom";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { coverBg, formatDate, readingTime } from "@/lib/posts";

export type PostCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  tags: string[];
  cover_color: string;
  body_md: string;
  published_at: string | null;
  likes: number;
  comments: number;
  bookmarks?: number;
};

export const PostCard = ({ post }: { post: PostCardData }) => {
  return (
    <article className="group bg-card rounded-2xl border border-border shadow-card overflow-hidden hover:shadow-elegant transition-shadow animate-fade-in">
      <Link to={`/post/${post.slug}`} className="block">
        <div className={`h-32 ${coverBg(post.cover_color)} relative`}>
          <span className="absolute bottom-3 left-4 text-white/90 text-xs font-medium tracking-wide uppercase">
            {readingTime(post.body_md)} min read
          </span>
        </div>
      </Link>
      <div className="p-5">
        <Link to={`/post/${post.slug}`}>
          <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
        </Link>
        {post.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <Link key={t} to={`/tag/${encodeURIComponent(t)}`} className="tag-chip">
                #{t}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(post.published_at)}</span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likes}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.comments}</span>
            {typeof post.bookmarks === "number" && (
              <span className="inline-flex items-center gap-1"><Bookmark className="h-3.5 w-3.5" /> {post.bookmarks}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
