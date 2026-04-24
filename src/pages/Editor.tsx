import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => { document.title = isEdit ? "Edit post · devnotes" : "New post · devnotes"; }, [isEdit]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { navigate("/"); return; }
    if (!isEdit) { setLoading(false); return; }
    (async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id!).maybeSingle();
      if (error || !data) { toast({ title: "Couldn't load post", variant: "destructive" }); navigate("/admin"); return; }
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt ?? "");
      setTagsInput((data.tags ?? []).join(", "));
      setCoverColor(data.cover_color);
      setBody(data.body_md || "");
      setStatus(data.status as "draft" | "published");
      setSlugTouched(true);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, authLoading, id]);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const tags = useMemo(
    () => tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8),
    [tagsInput]
  );

  async function save(nextStatus: "draft" | "published") {
    if (!user) return;
    if (!title.trim()) { toast({ title: "Title is required", variant: "destructive" }); return; }
    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) { toast({ title: "Slug is required", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim() || null,
      tags,
      cover_color: coverColor,
      body_md: body,
      status: nextStatus,
    };
    if (nextStatus === "published") {
      payload.published_at = new Date().toISOString();
    } else if (status === "published" && nextStatus === "draft") {
      payload.published_at = null;
    }

    let error: any = null;
    let savedSlug = finalSlug;
    if (isEdit) {
      const r = await supabase.from("posts").update(payload).eq("id", id!);
      error = r.error;
    } else {
      payload.author_id = user.id;
      const r = await supabase.from("posts").insert(payload).select("id, slug").single();
      error = r.error;
      if (r.data) savedSlug = r.data.slug;
    }
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setStatus(nextStatus);
    toast({ title: nextStatus === "published" ? "Published 🎉" : "Draft saved" });
    if (nextStatus === "published") {
      navigate(`/post/${savedSlug}`);
    } else if (!isEdit) {
      navigate("/admin");
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
            <Button variant="outline" onClick={() => save("draft")} disabled={saving}>
              <Save className="h-4 w-4" /> Save draft
            </Button>
            <Button onClick={() => save("published")} disabled={saving}>
              <Send className="h-4 w-4" /> {status === "published" ? "Update published" : "Publish"}
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
