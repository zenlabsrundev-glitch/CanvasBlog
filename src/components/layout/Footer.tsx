import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border mt-20 bg-card">
    <div className="container py-8 flex flex-col md:flex-row gap-3 items-center justify-between font-mono text-xs uppercase tracking-wider text-muted-foreground">
      <p>
        <span className="text-foreground">[ devnotes ]</span> // built with markdown // © {new Date().getFullYear()}
      </p>
      <nav className="flex gap-4">
        <Link to="/" className="hover:text-primary transition-colors">~/home</Link>
        <Link to="/bookmarks" className="hover:text-secondary transition-colors">~/bookmarks</Link>
      </nav>
    </div>
  </footer>
);
