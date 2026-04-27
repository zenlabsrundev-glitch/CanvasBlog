import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer";
import { COVER_COLORS, slugify } from "@/lib/posts";
import { ArrowLeft, Save, Send } from "lucide-react";
import api from "@/lib/api";

const STARTER = `# Hello, world

Write your post in **Markdown**. Code blocks get syntax highlighting:

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`\`\`

- [x] GFM tables
- [x] Task lists
- [x] Strikethrough

> Tip: use the right pane to preview live.
`;

const Editor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [coverColor, setCoverColor] = useState<string>("indigo");
  const [body, setBody] = useState(STARTER);
  const [published, setPublished] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => { document.title = isEdit ? "Edit post · devnotes" : "New post · devnotes"; }, [isEdit]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate("/"); return; }
    if (!isEdit) { setLoading(false); return; }
    
    async function loadPost() {
      setLoading(true);
      try {
        // Fetch all posts and find the one with this ID (since /posts/:id might not be available by slug, but user provided PUT by ID)
        // Actually, user provided GET by slug, let's try that or just get the list.
        // I'll try to find it in the list for now or assume GET /posts/:id works if provided.
        const response = await api.get("/posts");
        const found = response.data.find((p: any) => p.id === id);
        
        if (found) {
          setTitle(found.title);
          setSlug(found.slug);
          setExcerpt(found.excerpt ?? "");
          setTagsInput((found.tags ?? []).join(", "));
          setCoverColor(found.coverColor || found.cover_color || "indigo");
          setBody(found.content || found.body_md || "");
          setPublished(found.published);
          setSlugTouched(true);
        }
      } catch (error) {
        console.error("Failed to load post for editing:", error);
        toast({ title: "Failed to load post", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [isAdmin, authLoading, id, isEdit]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const tags = useMemo(
    () => tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
    [tagsInput]
  );

  async function save(shouldPublish: boolean) {
    if (!user) return;
    if (!title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) { toast({ title: "Slug is required", variant: "destructive" }); return; }
    setSaving(true);
    
    const postData = {
      title,
      slug: finalSlug,
      content: body,
      excerpt,
      coverColor,
      tags,
      published: shouldPublish
    };

    try {
      if (isEdit) {
        await api.put(`/posts/${id}`, postData);
        toast({ title: "Post updated" });
      } else {
        await api.post("/posts", postData);
        toast({ title: shouldPublish ? "Post published 🎉" : "Draft created" });
      }
      
      if (shouldPublish) {
        navigate(`/post/${finalSlug}`);
      } else {
        navigate("/admin");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      toast({ title: "Failed to save post", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <SiteLayout><div className="container py-20 text-muted-foreground">Loading editor…</div></SiteLayout>;
  }

  return (
    <SiteLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => save(false)} disabled={saving}>
              <Save className="h-4 w-4" /> {isEdit && !published ? "Save draft" : "Keep as draft"}
            </Button>
            <Button onClick={() => save(true)} disabled={saving}>
              <Send className="h-4 w-4" /> {isEdit && published ? "Update published" : "Publish"}
            </Button>
          </div>
        </div>

        {/* Meta */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A catchy title" className="text-lg font-semibold" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} placeholder="my-first-post" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="react, typescript, beginners" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="A short summary that appears on cards." />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Cover color</Label>
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCoverColor(c.value)}
                  className={`h-9 w-9 rounded-lg ${c.bg} ring-offset-2 ring-offset-background transition ${coverColor === c.value ? "ring-2 " + c.ring : ""}`}
                  aria-label={c.label}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Split-pane editor */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">Markdown</div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              spellCheck={false}
              className="flex-1 min-h-[60vh] resize-none bg-card p-4 font-mono text-sm leading-relaxed focus:outline-none"
              placeholder="Start writing in Markdown…"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</div>
            <div className="flex-1 min-h-[60vh] overflow-auto p-5">
              <MarkdownRenderer source={body} />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
};

export default Editor;
