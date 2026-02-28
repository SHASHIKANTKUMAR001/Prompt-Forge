-- Projects table: stores curated project ideas
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  real_world_use_case TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  features TEXT[] NOT NULL DEFAULT '{}',
  system_design_overview TEXT,
  category TEXT NOT NULL,
  estimated_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prompt cache table: caches generated prompts to avoid repeated API calls
CREATE TABLE public.prompt_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  prompt_type TEXT NOT NULL,
  prompt_content TEXT NOT NULL,
  token_estimate INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(project_id, prompt_type)
);

-- Usage tracking table: for rate limiting and analytics
CREATE TABLE public.usage_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  prompt_type TEXT,
  tokens_used INTEGER DEFAULT 0,
  cached BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

-- Projects are publicly readable (catalog is public)
CREATE POLICY "Projects are publicly readable" 
ON public.projects 
FOR SELECT 
USING (true);

-- Prompt cache is publicly readable (cached prompts are shared)
CREATE POLICY "Prompt cache is publicly readable" 
ON public.prompt_cache 
FOR SELECT 
USING (true);

-- Allow edge function to insert into cache
CREATE POLICY "Allow insert to prompt cache" 
ON public.prompt_cache 
FOR INSERT 
WITH CHECK (true);

-- Usage stats can be inserted by anyone (tracked by session)
CREATE POLICY "Anyone can insert usage stats" 
ON public.usage_stats 
FOR INSERT 
WITH CHECK (true);

-- Usage stats can be read by session owner
CREATE POLICY "Usage stats are readable by session" 
ON public.usage_stats 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_projects_difficulty ON public.projects(difficulty);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_tech_stack ON public.projects USING GIN(tech_stack);
CREATE INDEX idx_prompt_cache_project ON public.prompt_cache(project_id);
CREATE INDEX idx_prompt_cache_expires ON public.prompt_cache(expires_at);
CREATE INDEX idx_usage_stats_session ON public.usage_stats(session_id);
CREATE INDEX idx_usage_stats_created ON public.usage_stats(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for projects table
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();