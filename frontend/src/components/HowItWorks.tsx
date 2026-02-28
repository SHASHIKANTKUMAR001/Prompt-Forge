import { Search, Sparkles, Copy, Rocket } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse Projects',
    description: 'Explore curated project ideas filtered by difficulty and tech stack. Each project includes problem statements, features, and system design.',
  },
  {
    icon: Sparkles,
    title: 'Generate Prompts',
    description: 'Get AI-powered prompts for architecture, database schema, APIs, authentication, and more. Optimized for Cursor and ChatGPT.',
  },
  {
    icon: Copy,
    title: 'Copy & Build',
    description: 'One-click copy prompts directly to your clipboard. Export as Markdown for documentation. Start building immediately.',
  },
  {
    icon: Rocket,
    title: 'Ship Your Project',
    description: 'Use the structured prompts to build production-ready features faster. Perfect for portfolios, interviews, and learning.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-card/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to implementation in minutes, not hours.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}
              
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="text-xs font-mono text-muted-foreground mb-2">
                  0{index + 1}
                </span>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
