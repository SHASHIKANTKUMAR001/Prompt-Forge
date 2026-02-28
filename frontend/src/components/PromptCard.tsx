import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { PromptType, PromptCache, Project } from '@/lib/types';
import { PROMPT_TYPES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRateLimitStatus } from '@/hooks/useRateLimitStatus';

interface PromptCardProps {
  promptType: PromptType;
  project: Project;
  cachedPrompt?: PromptCache;
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: (content: string) => void;
}

export function PromptCard({
  promptType,
  project,
  cachedPrompt,
  isGenerating,
  onGenerate,
  onCopy
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { data: rateLimitStatus } = useRateLimitStatus(promptType);
  
  const config = PROMPT_TYPES.find(p => p.type === promptType)!;
  const isLimited = rateLimitStatus?.isLimited ?? false;
  const remaining = rateLimitStatus?.remaining ?? 10;
  const limit = rateLimitStatus?.limit ?? 10;
  const percentage = ((limit - remaining) / limit) * 100;

  // Countdown timer for rate limit reset
  useEffect(() => {
    if (rateLimitStatus?.resetInSeconds && rateLimitStatus.resetInSeconds > 0) {
      setCountdown(rateLimitStatus.resetInSeconds);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCountdown(null);
    }
  }, [rateLimitStatus?.resetInSeconds]);

  const handleCopy = () => {
    if (cachedPrompt?.prompt_content) {
      onCopy(cachedPrompt.prompt_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className={cn(
      "bg-card/50 border-border/50 transition-all",
      cachedPrompt && "border-primary/30",
      isLimited && "border-warning/30"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <CardTitle className="text-base">{config.label}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {config.description}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            {cachedPrompt && cachedPrompt.token_estimate && (
              <span className="text-xs text-muted-foreground font-mono">
                ~{cachedPrompt.token_estimate} tokens
              </span>
            )}
            {!cachedPrompt && (
              <span className={cn(
                "text-xs font-mono",
                isLimited ? "text-warning" : "text-muted-foreground"
              )}>
                {remaining}/{limit}
              </span>
            )}
          </div>
        </div>
        
        {/* Rate limit progress indicator */}
        {!cachedPrompt && rateLimitStatus && (
          <div className="mt-3 space-y-1">
            <Progress 
              value={percentage} 
              className={cn(
                "h-1",
                isLimited && "[&>div]:bg-warning",
                percentage >= 80 && !isLimited && "[&>div]:bg-warning"
              )} 
            />
            {isLimited && countdown !== null && countdown > 0 && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <Clock className="h-3 w-3" />
                <span>Resets in {countdown}s</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {cachedPrompt ? (
          <div className="space-y-3">
            <div className="relative">
              <pre className="text-xs font-mono bg-secondary/30 rounded-lg p-4 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {cachedPrompt.prompt_content}
              </pre>
            </div>
            <Button 
              onClick={handleCopy} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-success" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={onGenerate}
              disabled={isGenerating || isLimited}
              variant="secondary"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : isLimited ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Rate Limited
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Prompt
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
