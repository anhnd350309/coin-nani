import { Router, Request, Response } from "express";
import { launchToken } from "../controllers/tokenController";

const router = Router();

router.post("/launch-token", launchToken);
export default router;
