export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  tags: string[];
  cover_color: string;
  published_at: string;
  status: "published" | "draft";
  likes: number;
  comments: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile: {
    display_name: string;
  };
}

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    slug: "getting-started-with-react-and-typescript",
    title: "Getting Started with React and TypeScript",
    excerpt: "A comprehensive guide for beginners to set up their first React project with TypeScript and best practices.",
    body_md: `# Getting Started with React and TypeScript\n\nTypeScript is a powerful tool for React developers...`,
    tags: ["react", "typescript", "frontend"],
    cover_color: "blue",
    published_at: new Date().toISOString(),
    status: "published",
    likes: 12,
    comments: 4,
  },
  {
    id: "2",
    slug: "mastering-tailwind-css",
    title: "Mastering Tailwind CSS for Modern UI",
    excerpt: "Learn how to build beautiful, responsive interfaces faster with utility-first CSS framework.",
    body_md: `# Mastering Tailwind CSS\n\nTailwind CSS has changed the way we build websites...`,
    tags: ["tailwind", "css", "design"],
    cover_color: "indigo",
    published_at: new Date(Date.now() - 86400000).toISOString(),
    status: "published",
    likes: 25,
    comments: 8,
  },
  {
    id: "3",
    slug: "understanding-the-event-loop",
    title: "Understanding the JavaScript Event Loop",
    excerpt: "Deep dive into how JavaScript handles asynchronous operations under the hood.",
    body_md: `# Understanding the Event Loop\n\nTo understand JavaScript, you must understand the event loop...`,
    tags: ["javascript", "async", "backend"],
    cover_color: "yellow",
    published_at: new Date(Date.now() - 172800000).toISOString(),
    status: "published",
    likes: 42,
    comments: 15,
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    post_id: "1",
    user_id: "u1",
    body: "Great article! This really helped me get set up.",
    created_at: new Date().toISOString(),
    profile: { display_name: "John Doe" }
  },
  {
    id: "c2",
    post_id: "1",
    user_id: "u2",
    body: "Can you explain more about tsconfig settings?",
    created_at: new Date().toISOString(),
    profile: { display_name: "Jane Smith" }
  }
];
