export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  problem_statement: string;
  real_world_use_case: string;
  difficulty: Difficulty;
  tech_stack: string[];
  features: string[];
  system_design_overview: string | null;
  category: string;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export type PromptType = 
  | 'architecture'
  | 'database'
  | 'backend-api'
  | 'authentication'
  | 'edge-cases'
  | 'cursor-optimized';

export interface PromptCache {
  id: string;
  project_id: string;
  prompt_type: PromptType;
  prompt_content: string;
  token_estimate: number | null;
  created_at: string;
  expires_at: string;
}

export interface UsageStats {
  id: string;
  session_id: string;
  project_id: string | null;
  prompt_type: string | null;
  tokens_used: number;
  cached: boolean;
  created_at: string;
}

export const PROMPT_TYPES: { type: PromptType; label: string; description: string; icon: string }[] = [
  {
    type: 'architecture',
    label: 'Architecture',
    description: 'System design and component structure',
    icon: '🏗️'
  },
  {
    type: 'database',
    label: 'Database Schema',
    description: 'Tables, relationships, and indexes',
    icon: '🗄️'
  },
  {
    type: 'backend-api',
    label: 'Backend API',
    description: 'REST endpoints and business logic',
    icon: '⚡'
  },
  {
    type: 'authentication',
    label: 'Auth & Security',
    description: 'Authentication and authorization',
    icon: '🔐'
  },
  {
    type: 'edge-cases',
    label: 'Edge Cases',
    description: 'Scalability and error handling',
    icon: '🎯'
  },
  {
    type: 'cursor-optimized',
    label: 'Cursor Prompt',
    description: 'Optimized for Cursor AI editor',
    icon: '✨'
  }
];

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  beginner: { label: 'Beginner', color: 'bg-success/20 text-success border-success/30' },
  intermediate: { label: 'Intermediate', color: 'bg-warning/20 text-warning border-warning/30' },
  advanced: { label: 'Advanced', color: 'bg-destructive/20 text-destructive border-destructive/30' }
};
