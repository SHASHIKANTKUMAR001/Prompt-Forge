import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/client';
import { cn } from '@/lib/utils';

interface RateLimitStatus {
  promptType: string;
  used: number;
  limit: number;
  resetInSeconds: number | null;
}

interface RateLimitIndicatorProps {
  sessionId: string;
  promptType?: string;
  className?: string;
}

export function RateLimitIndicator({ sessionId, promptType, className }: RateLimitIndicatorProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      
      // Fetch usage stats for this session
      const { data: usageData, error: usageError } = await supabase
        .from('usage_stats')
        .select('prompt_type, created_at')
        .eq('session_id', sessionId)
        .eq('cached', false)
        .gte('created_at', oneMinuteAgo);

      if (usageError) {
        console.error('Error fetching usage stats:', usageError);
        return;
      }

      // Fetch rate limit config
      const { data: configData, error: configError } = await supabase
        .from('rate_limit_config')
        .select('*')
        .eq('prompt_type', promptType || 'architecture')
        .single();

      if (configError) {
        console.error('Error fetching rate limit config:', configError);
        return;
      }

      const config = configData as { requests_per_minute: number };
      const usedCount = promptType 
        ? usageData?.filter(u => u.prompt_type === promptType).length || 0
        : usageData?.length || 0;

      // Calculate reset time
      let resetInSeconds: number | null = null;
      if (usageData && usageData.length > 0) {
        const oldestRequest = usageData.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        const oldestTime = new Date(oldestRequest.created_at).getTime();
        const resetTime = oldestTime + 60000;
        resetInSeconds = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
      }

      setStatus({
        promptType: promptType || 'all',
        used: usedCount,
        limit: config.requests_per_minute,
        resetInSeconds: usedCount >= config.requests_per_minute ? resetInSeconds : null
      });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [sessionId, promptType]);

  // Countdown timer
  useEffect(() => {
    if (status?.resetInSeconds !== null && status.resetInSeconds > 0) {
      setCountdown(status.resetInSeconds);
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
  }, [status?.resetInSeconds]);

  if (!status) return null;

  const percentage = (status.used / status.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = status.used >= status.limit;

  return (
    <Card className={cn(
      "bg-card/50 border-border/50",
      isAtLimit && "border-destructive/50",
      isNearLimit && !isAtLimit && "border-warning/50",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAtLimit ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : isNearLimit ? (
              <Clock className="h-4 w-4 text-warning" />
            ) : (
              <Zap className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium">
              Rate Limit
            </span>
          </div>
          <span className={cn(
            "text-sm font-mono",
            isAtLimit && "text-destructive",
            isNearLimit && !isAtLimit && "text-warning"
          )}>
            {status.used}/{status.limit}
          </span>
        </div>
        
        <Progress 
          value={percentage} 
          className={cn(
            "h-2",
            isAtLimit && "[&>div]:bg-destructive",
            isNearLimit && !isAtLimit && "[&>div]:bg-warning"
          )} 
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Requests per minute
          </span>
          {countdown !== null && countdown > 0 ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resets in {countdown}s
            </span>
          ) : status.used > 0 ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              Available
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
