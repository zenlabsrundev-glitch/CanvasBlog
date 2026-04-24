
# Student Markdown Tech Blog — Plan

A personal technical blog where you (the single author) write Markdown articles with syntax-highlighted code, and readers can engage via comments, likes, bookmarks, and tag browsing.

## Visual style
Dev.to-inspired: light theme, rounded cards, soft pastel accents (indigo/teal/coral), generous spacing, very readable typography. Friendly, approachable, slightly playful.

## Pages & layout

**Public header** with logo, search-by-tag, and Sign in / profile menu.

1. **Home (`/`)** — Hero with your name/tagline, list of latest posts as cards (cover color, title, excerpt, tags, reading time, like/comment counts).
2. **Post detail (`/post/:slug`)** — Rendered Markdown with syntax-highlighted code blocks (copy-to-clipboard button), tag chips, like button, bookmark button, and a comments thread at the bottom.
3. **Tag page (`/tag/:tag`)** — All posts filtered by a tag.
4. **Bookmarks (`/bookmarks`)** — Reader's saved posts (requires sign in).
5. **Admin dashboard (`/admin`)** — Only visible to you. Lists drafts and published posts with edit/delete/publish toggle.
6. **Editor (`/admin/new`, `/admin/edit/:id`)** — Split-pane: Markdown on the left, live rendered preview on the right (with syntax highlighting). Fields for title, slug, excerpt, tags, cover color, and a Save Draft / Publish action.
7. **Auth (`/auth`)** — Sign up / sign in for readers (so they can comment, like, bookmark).

## Roles
- **Admin (you)** — only one account, identified via a `user_roles` table. Full CRUD on posts.
- **Reader** — any signed-up user. Can comment, like, bookmark.
- **Anonymous** — can read posts and browse tags.

## Markdown features
- GitHub-flavored Markdown (tables, task lists, strikethrough)
- Syntax-highlighted code blocks (multi-language) with copy button
- Auto-generated heading anchors
- Image and link support
- Live preview while writing

## Engagement
- **Tags** — multi-tag per post; clickable chips; tag index for filtering
- **Comments** — signed-in readers post comments under each article (newest-first thread, with author name and timestamp; you can delete any comment)
- **Likes** — one like per user per post; live count
- **Bookmarks** — save/unsave; dedicated Bookmarks page

## Backend (Lovable Cloud)
- Auth (email/password) with the first registered user auto-promoted to `admin` role; subsequent users are `reader`.
- Tables: `profiles`, `user_roles`, `posts` (with status: draft/published, slug, markdown body, tags array, cover color), `comments`, `likes`, `bookmarks`.
- Row-Level Security: only admin can write/update/delete posts; readers manage their own comments/likes/bookmarks; published posts are world-readable.

## Out of scope (can add later)
Image uploads, post scheduling, RSS feed, multi-author, email notifications, view counts.
