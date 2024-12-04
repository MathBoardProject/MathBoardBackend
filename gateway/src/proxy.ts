import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

const serverPORT = process.env.SERVER_PORT;

if (!serverPORT) {
    logger.error("No server port provided in .ENV file.");
    process.exit(1);
}

import { Router } from "express";
import axios from "axios";
import logger from "./logger";

const router = Router();

router.post("/*", async (req, res) => {
    try {
        const route = req.originalUrl;


        const response = await axios.post(`http://localhost:${serverPORT}${route}`, req.body, {
            headers: { "Content-Type": req.headers["content-type"] }
        });
        res.json(response.data);

    } catch (error) {
        const err = (error as Error);

        logger.error("Error during gateway pass", {
            message: err.message,
            stack: err.stack,
        });

        if (axios.isAxiosError(err)) {
            res.status(err.response?.status || 500)
                .json({
                    error: "Request blocked on gateway",
                    details: err.message,
                    serverResponse: err.response?.data || "No response from the server",
                });
        } else {
            res.status(500)
                .json({
                    error: "Unknown error occured",
                    details: err.message
                });
        }
    }
});

export default router;