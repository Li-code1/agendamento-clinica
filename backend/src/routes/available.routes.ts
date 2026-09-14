import { Router } from "express";
import { getAvailableHandler } from "../controllers/available.controller";

const router = Router();

router.get("/", getAvailableHandler);

export default router;
