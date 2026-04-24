import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border mt-20">
    <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row gap-3 items-center justify-between">
      <p>
        Built with <span className="text-accent">♥</span> using Markdown. © {new Date().getFullYear()} devnotes.
      </p>
      <nav className="flex gap-4">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <Link to="/bookmarks" className="hover:text-foreground">Bookmarks</Link>
      </nav>
    </div>
  </footer>
);
