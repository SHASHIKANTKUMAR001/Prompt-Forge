import { Router } from "express";
import { fetchProjects } from "../controllers/projectController";

const router = Router();
router.get("/", fetchProjects);

export default router;
