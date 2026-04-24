import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

function CodeBlock({ children, className }: { children: any; className?: string }) {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
        type="button"
        aria-label="Copy code"
      >
        {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
      </button>
      <code className={className}>{children}</code>
    </div>
  );
}

export const MarkdownRenderer = ({ source }: { source: string }) => (
  <div className="prose-article">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
      components={{
        code({ inline, className, children, ...props }: any) {
          if (inline) {
            return <code className={className} {...props}>{children}</code>;
          }
          return <CodeBlock className={className}>{children}</CodeBlock>;
        },
        a({ href, children, ...props }) {
          const external = href?.startsWith("http");
          return (
            <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {source}
    </ReactMarkdown>
  </div>
);
