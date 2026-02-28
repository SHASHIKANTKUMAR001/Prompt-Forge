import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/client"
import type { PromptType } from '@/lib/types';
import { Database } from '@/integrations/types';

interface RateLimitConfig {
  prompt_type: string;
  requests_per_minute: number;
  cache_ttl_hours: number;
  is_enabled: boolean;
}

interface RateLimitUsage {
  promptType: string;
  used: number;
  limit: number;
  remaining: number;
  isLimited: boolean;
  resetInSeconds: number | null;
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('promptforge_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('promptforge_session', sessionId);
  }
  return sessionId;
}

export function useRateLimitConfig() {
  return useQuery({
    queryKey: ['rate-limit-config'],
    queryFn: async (): Promise<RateLimitConfig[]> => {
      const { data, error } = await supabase
        .from('rate_limit_config')
        .select('*');

      if (error) throw error;
      return data as RateLimitConfig[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRateLimitStatus(promptType?: PromptType) {
  const sessionId = getSessionId();
  const { data: configs } = useRateLimitConfig();

  return useQuery({
    queryKey: ['rate-limit-status', sessionId, promptType],
    queryFn: async (): Promise<RateLimitUsage> => {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

      // Fetch recent non-cached requests
      const query = supabase
        .from('usage_stats')
        .select('prompt_type, created_at')
        .eq('session_id', sessionId)
        .eq('cached', false)
        .gte('created_at', oneMinuteAgo);

      if (promptType) {
        query.eq('prompt_type', promptType);
      }

      const { data: usageData, error } = await query;
      if (error) throw error;

      const config = configs?.find(c => c.prompt_type === (promptType || 'architecture'));
      const limit = config?.requests_per_minute || 10;
      const used = usageData?.length || 0;

      // Calculate reset time from oldest request
      let resetInSeconds: number | null = null;
      if (usageData && usageData.length > 0) {
        const sortedUsage = [...usageData].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const oldestTime = new Date(sortedUsage[0].created_at).getTime();
        const resetTime = oldestTime + 60000;
        resetInSeconds = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
      }

      return {
        promptType: promptType || 'all',
        used,
        limit,
        remaining: Math.max(0, limit - used),
        isLimited: used >= limit,
        resetInSeconds: used >= limit ? resetInSeconds : null
      };
    },
    enabled: !!configs,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider stale after 5 seconds
  });
}

export function useAllRateLimits() {
  const sessionId = getSessionId();
  const { data: configs } = useRateLimitConfig();

  return useQuery({
    queryKey: ['all-rate-limits', sessionId],
    queryFn: async (): Promise<Record<string, RateLimitUsage>> => {
      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

      const { data: usageData, error } = await supabase
        .from('usage_stats')
        .select('prompt_type, created_at')
        .eq('session_id', sessionId)
        .eq('cached', false)
        .gte('created_at', oneMinuteAgo);

      if (error) throw error;

      const result: Record<string, RateLimitUsage> = {};

      for (const config of (configs || [])) {
        const typeUsage = usageData?.filter(u => u.prompt_type === config.prompt_type) || [];
        const used = typeUsage.length;

        let resetInSeconds: number | null = null;
        if (typeUsage.length > 0) {
          const sortedUsage = [...typeUsage].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          const oldestTime = new Date(sortedUsage[0].created_at).getTime();
          const resetTime = oldestTime + 60000;
          resetInSeconds = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
        }

        result[config.prompt_type] = {
          promptType: config.prompt_type,
          used,
          limit: config.requests_per_minute,
          remaining: Math.max(0, config.requests_per_minute - used),
          isLimited: used >= config.requests_per_minute,
          resetInSeconds: used >= config.requests_per_minute ? resetInSeconds : null
        };
      }

      return result;
    },
    enabled: !!configs,
    refetchInterval: 10000,
    staleTime: 5000,
  });
}
