import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import express, { Router, Request, Response } from "express";
import logger from "../logger";
import PoolConnection from "../database/Pool";

const router = Router();
router.use(express.json());

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;
const pool = new PoolConnection(
    DB_HOST,
    Number(DB_PORT),
    DB_USER,
    DB_PASSWORD,
    "mathBoard"
);

router.post("/pushStrokes", (req: Request, res: Response) => {
    try {
        const { boardId } = req.body;
        const { svg, x, y } = req.body.stroke;
        pool.pushStrokes(boardId, svg, x, y);
    } catch (err) {
        logger.error("Unexpected Error during /pushStrokes", err);
    }
});

router.post("/deleteStrokes", (req: Request, res: Response) => {
    try {
        const { boardId } = req.body;
        const id = req.body.stroke.id;
        pool.deleteStrokes(boardId, id);
    } catch (err) {
        logger.error("Unexpected Error during /deleteStrokes", err);
    }
});

router.post("/editStrokes", (req: Request, res: Response) => {
    try {
        const { boardId } = req.body;
        const { id, svg, x, y } = req.body.stroke;
    } catch (err) {
        logger.error("Unexpected Error during /editStrokes", err);
    }
});

export default router;