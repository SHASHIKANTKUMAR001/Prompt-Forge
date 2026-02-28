import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Layers, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PromptCard } from '@/components/PromptCard';
import { useProject } from '@/hooks/useProjects';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { PROMPT_TYPES, DIFFICULTY_CONFIG, type PromptType, type PromptCache } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading } = useProject(slug || '');
  const { 
    isGenerating, 
    generatedPrompts, 
    generatePrompt, 
    copyToClipboard,
    exportAsMarkdown 
  } = usePromptGenerator();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col dark">
        <Header />
        <main className="flex-1 container py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-full max-w-xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col dark">
        <Header />
        <main className="flex-1 container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Button asChild>
            <Link to="/projects">Back to Projects</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const difficultyConfig = DIFFICULTY_CONFIG[project.difficulty];

  const handleGeneratePrompt = async (promptType: PromptType) => {
    await generatePrompt(project.id, promptType, {
      title: project.title,
      description: project.description,
      problem_statement: project.problem_statement,
      features: project.features,
      tech_stack: project.tech_stack,
      system_design_overview: project.system_design_overview
    });
  };

  const allGeneratedPrompts = Object.values(generatedPrompts).filter(
    p => p.project_id === project.id
  ) as PromptCache[];

  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          {/* Back Button */}
          <Link 
            to="/projects" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge 
                variant="outline" 
                className={cn("text-sm", difficultyConfig.color)}
              >
                {difficultyConfig.label}
              </Badge>
              <Badge variant="secondary">{project.category}</Badge>
              {project.estimated_hours && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {project.estimated_hours} hours
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Layers className="h-4 w-4" />
                {project.features.length} features
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {project.description}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Project Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Problem Statement */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Problem Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {project.problem_statement}
                  </p>
                </CardContent>
              </Card>

              {/* Real World Use Case */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Real-World Use Case</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {project.real_world_use_case}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* System Design */}
              {project.system_design_overview && (
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">System Design Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {project.system_design_overview}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tech Stack */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Tech Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <span 
                        key={tech}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono bg-secondary/50 text-secondary-foreground border border-border/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Prompt Generator */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">AI Prompts</h2>
                {allGeneratedPrompts.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportAsMarkdown(project.title, allGeneratedPrompts)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export MD
                  </Button>
                )}
              </div>

              {PROMPT_TYPES.map((pt) => (
                <PromptCard
                  key={pt.type}
                  promptType={pt.type}
                  project={project}
                  cachedPrompt={generatedPrompts[`${project.id}-${pt.type}`]}
                  isGenerating={isGenerating}
                  onGenerate={() => handleGeneratePrompt(pt.type)}
                  onCopy={copyToClipboard}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetailPage;
