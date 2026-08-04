import { Router } from 'express';
import { createMatch, getMatches } from "../controllers/matche.controller.js";

export const matchesRouter = Router();

matchesRouter.get('/', getMatches);

matchesRouter.post("/", createMatch);
