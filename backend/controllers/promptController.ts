import { Response, RequestHandler } from "express";
import { getProjectById } from "../models/projectModel";
import { getCachedPrompt, cachePrompt } from "../models/promptModel";
import { logUsage } from "../models/usageModel";
import { generateWithAI } from "../services/openAi";
import { PromptParams, GeneratePromptBody } from "../types/requestTypes";
import { getRateLimitConfig } from "../models/rateLimitModel";

export const generatePrompt: RequestHandler<PromptParams, any, GeneratePromptBody> = async (req, res: Response) => {
  console.log("generatePrompt called:", req.params.projectId);

  const { projectId } = req.params;
  const { sessionId, promptType, projectData } = req.body;

  if (!promptType) {
    return res.status(400).json({ error: "Missing promptType" });
  }

  try {
    // Fetch project
    const { data: project } = await getProjectById(projectId);

    let projectTitle: string;
    let projectCategory: string;

    if (project) {
      projectTitle = project.title;
      projectCategory = project.category;
    } else if (projectData) {
      projectTitle = projectData.title;
      projectCategory =
        projectData.tech_stack?.join(", ") ||
        projectData.description ||
        "unspecified";
    } else {
      return res.status(400).json({ error: "Missing project data" });
    }

    // Check cache
    const { data: cached } = await getCachedPrompt(projectId, promptType);
    if (cached) {
      await logUsage(sessionId, projectId, promptType, 0, true);
      return res.json({ prompt_content: cached.prompt_content, cached: true });
    }

    // Rate limit config
    const { data: config } = await getRateLimitConfig(promptType);
    const cacheTtlHours = config?.cache_ttl_hours ?? 168;

    // Build prompt
    const systemPrompt = `
Generate a detailed ${promptType} prompt for the following project.

Project Title:
${projectTitle}

Category / Tech Stack:
${projectCategory}

Requirements:
- Professional
- Structured
- Production-ready
- Detailed explanation
`;

    // Call OpenAI
    let generatedContent: string;
    try {
      generatedContent = await generateWithAI(systemPrompt);
    } catch (aiError: any) {
      console.error("OpenAI failed:", aiError.message);
      return res.status(502).json({ error: "AI generation failed" });
    }

    const tokenEstimate = Math.ceil(generatedContent.length / 4);

    // Cache
    const { data: newCache } = await cachePrompt(
      projectId,
      promptType,
      generatedContent,
      tokenEstimate,
      cacheTtlHours
    );

    // Log usage
    await logUsage(sessionId, projectId, promptType, tokenEstimate, false);

    return res.json({
      prompt_content: newCache?.prompt_content || generatedContent,
      cached: false,
    });
  } catch (error: any) {
    console.error("generatePrompt error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
};
