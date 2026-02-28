import { Request, Response } from "express";
import { getAllProjects } from "../models/projectModel";

export async function fetchProjects(req: Request, res: Response) {
  const { data, error } = await getAllProjects();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
}
