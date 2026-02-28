import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/client';
import type { Project, Difficulty } from '@/lib/types';

export interface ProjectFilters {
  difficulty?: Difficulty | null;
  techStack?: string | null;
  category?: string | null;
  search?: string;
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.techStack) {
        query = query.contains('tech_stack', [filters.techStack]);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Project[];
    }
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!slug
  });
}

export function useProjectCategories() {
  return useQuery({
    queryKey: ['project-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('category');

      if (error) throw error;
      const categories = [...new Set(data.map(p => p.category))];
      return categories.sort();
    }
  });
}

export function useProjectTechStacks() {
  return useQuery({
    queryKey: ['project-tech-stacks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('tech_stack');

      if (error) throw error;
      const stacks = [...new Set(data.flatMap(p => p.tech_stack))];
      return stacks.sort();
    }
  });
}
