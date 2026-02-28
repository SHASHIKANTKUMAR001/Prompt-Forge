import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">
              Prompt<span className="text-primary">Forge</span>
            </span>
          </div>

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Built for developers <Heart className="h-3 w-3 text-destructive" />
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 PromptForge</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
