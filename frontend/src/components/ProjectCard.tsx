import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import type { Project } from '@/lib/types';
import { DIFFICULTY_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const difficultyConfig = DIFFICULTY_CONFIG[project.difficulty];

  return (
    <Link to={`/projects/${project.slug}`} className="group block">
      <Card className="h-full bg-card/50 border-border/50 hover:border-primary/50 hover:bg-card transition-all duration-300 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs font-medium", difficultyConfig.color)}
            >
              {difficultyConfig.label}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {project.category}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold mt-3 group-hover:text-primary transition-colors line-clamp-2">
            {project.title}
          </h3>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span 
                key={tech}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono bg-secondary/50 text-secondary-foreground"
              >
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs text-muted-foreground">
                +{project.tech_stack.length - 4} more
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            {project.estimated_hours && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {project.estimated_hours}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {project.features.length} features
            </span>
          </div>
          <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
        </CardFooter>
      </Card>
    </Link>
  );
}
