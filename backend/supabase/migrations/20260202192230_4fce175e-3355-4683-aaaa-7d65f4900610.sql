-- Create rate_limit_config table for configurable limits
CREATE TABLE public.rate_limit_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_type TEXT NOT NULL UNIQUE,
  requests_per_minute INTEGER NOT NULL DEFAULT 10,
  cache_ttl_hours INTEGER NOT NULL DEFAULT 168, -- 7 days default
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limit_config ENABLE ROW LEVEL SECURITY;

-- Public read access for rate limit config
CREATE POLICY "Rate limit config is publicly readable"
ON public.rate_limit_config
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_rate_limit_config_updated_at
BEFORE UPDATE ON public.rate_limit_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default rate limits for each prompt type
INSERT INTO public.rate_limit_config (prompt_type, requests_per_minute, cache_ttl_hours) VALUES
  ('architecture', 10, 168),
  ('database', 10, 168),
  ('backend-api', 10, 168),
  ('authentication', 10, 168),
  ('edge-cases', 8, 168),
  ('cursor-optimized', 5, 168);

-- Add index for faster lookups
CREATE INDEX idx_rate_limit_config_prompt_type ON public.rate_limit_config(prompt_type);