import { Router } from "express";
import { generatePrompt } from "../controllers/promptController";
import { rateLimit } from "../middleware/rateLimitMiddleware";
import { PromptParams } from "../types/requestTypes";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();
router.post<PromptParams>("/:projectId/generate",requireAuth, rateLimit, generatePrompt);

export default router;
