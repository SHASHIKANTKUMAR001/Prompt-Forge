import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Difficulty } from '@/lib/types';
import { DIFFICULTY_CONFIG } from '@/lib/types';
import type { ProjectFilters as Filters } from '@/hooks/useProjects';

interface ProjectFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: string[];
  techStacks: string[];
}

export function ProjectFilters({ 
  filters, 
  onFilterChange, 
  categories, 
  techStacks 
}: ProjectFiltersProps) {
  const activeFiltersCount = [
    filters.difficulty,
    filters.category,
    filters.techStack,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onFilterChange({ search: filters.search });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 bg-secondary/30 border-border/50 focus:border-primary/50"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        {/* Difficulty */}
        <Select
          value={filters.difficulty || 'all'}
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              difficulty: value === 'all' ? null : value as Difficulty 
            })
          }
        >
          <SelectTrigger className="w-[140px] bg-secondary/30 border-border/50">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              category: value === 'all' ? null : value 
            })
          }
        >
          <SelectTrigger className="w-[140px] bg-secondary/30 border-border/50">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tech Stack */}
        <Select
          value={filters.techStack || 'all'}
          onValueChange={(value) => 
            onFilterChange({ 
              ...filters, 
              techStack: value === 'all' ? null : value 
            })
          }
        >
          <SelectTrigger className="w-[150px] bg-secondary/30 border-border/50">
            <SelectValue placeholder="Tech Stack" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stacks</SelectItem>
            {techStacks.map((stack) => (
              <SelectItem key={stack} value={stack}>
                {stack}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.difficulty && (
            <Badge variant="secondary" className="gap-1">
              {DIFFICULTY_CONFIG[filters.difficulty].label}
              <button 
                onClick={() => onFilterChange({ ...filters, difficulty: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <button 
                onClick={() => onFilterChange({ ...filters, category: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.techStack && (
            <Badge variant="secondary" className="gap-1 font-mono">
              {filters.techStack}
              <button 
                onClick={() => onFilterChange({ ...filters, techStack: null })}
                className="ml-1 hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
