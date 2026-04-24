import { Link } from "react-router-dom";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import { formatDate, readingTime } from "@/lib/posts";

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

// Map cover_color to one of three accent shadows (deterministic, themed)
const accentForPost = (color: string): "primary" | "secondary" | "accent" => {
  const v = (color || "").toLowerCase();
  if (v.includes("teal") || v.includes("green") || v.includes("emerald")) return "secondary";
  if (v.includes("rose") || v.includes("red") || v.includes("orange") || v.includes("coral") || v.includes("pink")) return "accent";
  return "primary";
};

const shadowMap = {
  primary: {
    rest: "shadow-[0_4px_0_0_hsl(var(--border))]",
    hover: "hover:shadow-[0_4px_0_0_hsl(var(--primary))] hover:border-primary",
    text: "group-hover:text-primary",
    chip: "border-primary/40 bg-primary/5 text-primary",
  },
  secondary: {
    rest: "shadow-[0_4px_0_0_hsl(var(--border))]",
    hover: "hover:shadow-[0_4px_0_0_hsl(var(--secondary))] hover:border-secondary",
    text: "group-hover:text-secondary",
    chip: "border-secondary/40 bg-secondary/5 text-secondary",
  },
  accent: {
    rest: "shadow-[0_4px_0_0_hsl(var(--border))]",
    hover: "hover:shadow-[0_4px_0_0_hsl(var(--accent))] hover:border-accent",
    text: "group-hover:text-accent",
    chip: "border-accent/40 bg-accent/5 text-accent",
  },
};

export const PostCard = ({ post }: { post: PostCardData }) => {
  const accent = accentForPost(post.cover_color);
  const s = shadowMap[accent];

  return (
    <article
      className={`group bg-card border border-border rounded-sm flex flex-col ${s.rest} ${s.hover} hover:-translate-y-0.5 transition-all duration-150 animate-fade-in`}
    >
      <div className="p-6 flex flex-col flex-1 gap-4">
        <header className="flex justify-between items-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{formatDate(post.published_at)}</span>
          <span className="bg-muted px-2 py-1 border border-border rounded-sm">
            {readingTime(post.body_md)} min
          </span>
        </header>

        <Link to={`/post/${post.slug}`}>
          <h3 className={`font-display font-bold text-xl leading-tight tracking-tight text-balance transition-colors ${s.text}`}>
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
            {post.tags.slice(0, 3).map((t, i) => (
              <Link
                key={t}
                to={`/tag/${encodeURIComponent(t)}`}
                className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border rounded-sm transition-colors ${
                  i === 0 ? s.chip : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-border px-6 py-3 flex justify-between items-center font-mono text-xs bg-muted/40 rounded-b-sm">
        <span className="text-foreground tabular-nums">[ {post.likes} {post.likes === 1 ? "like" : "likes"} ]</span>
        <span className="flex items-center gap-3 text-muted-foreground tabular-nums">
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {post.comments}</span>
          {typeof post.bookmarks === "number" && (
            <span className="inline-flex items-center gap-1"><Bookmark className="h-3 w-3" /> {post.bookmarks}</span>
          )}
        </span>
      </footer>
    </article>
  );
};
