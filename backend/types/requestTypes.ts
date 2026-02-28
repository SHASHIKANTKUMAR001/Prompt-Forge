import { ParamsDictionary } from "express-serve-static-core";

export interface PromptParams extends ParamsDictionary {
  projectId: string;
}

export interface PromptBody {
  category: string;
  sessionId: string;
}

export interface RateLimitBody {
  sessionId: string;
  promptType: string;
}

export interface GeneratePromptBody {
  sessionId: string;
  promptType: string;
  projectData?: {
    title: string;
    description: string;
    problem_statement: string;
    features: string[];
    tech_stack: string[];
    system_design_overview: string | null;
  };
}
