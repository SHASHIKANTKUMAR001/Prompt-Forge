import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Github, Coins } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useCredits } from '@/hooks/useCredits';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { credits, loading } = useCredits();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between px-4">

        {/* ================= LOGO ================= */}

        {/* Desktop Logo (with sparkle) */}
        <Link to="/" className="hidden md:flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Prompt<span className="text-primary">Forge</span>
          </span>
        </Link>

        {/* Mobile Logo (text only) */}
        <Link to="/" className="md:hidden text-xl font-bold tracking-tight">
          Prompt<span className="text-primary">Forge</span>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/projects"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Projects
          </Link>
          <Link
            to="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>

        {/* ================= RIGHT SIDE ================= */}

        <div className="flex items-center gap-2">

          {/* Credits Badge (same on mobile & desktop) */}
          <SignedIn>
            {!loading && credits !== null && (
              <Link to="/pricing">
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                >
                  <Coins className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-white">
                    {credits} credits
                  </span>
                </Badge>
              </Link>
            )}
          </SignedIn>

          {/* Desktop Browse */}
          <Button variant="ghost" size="sm" asChild className="hidden md:flex">
            <Link to="/projects">Browse Projects</Link>
          </Button>

          <SignedOut>
            <Button size="sm" asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
