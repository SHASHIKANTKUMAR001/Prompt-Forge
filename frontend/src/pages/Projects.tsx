import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectFilters } from '@/components/ProjectFilters';
import { useProjects, useProjectCategories, useProjectTechStacks, type ProjectFilters as Filters } from '@/hooks/useProjects';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectsPage = () => {
  const [filters, setFilters] = useState<Filters>({});
  
  const { data: projects, isLoading } = useProjects(filters);
  const { data: categories = [] } = useProjectCategories();
  const { data: techStacks = [] } = useProjectTechStacks();

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          {/* Page Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Project Ideas
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Curated software projects with detailed AI prompts. Filter by difficulty and tech stack to find your next portfolio piece.
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <ProjectFilters
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              techStacks={techStacks}
            />
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-lg" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {projects.length} project{projects.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-2">
                No projects found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
