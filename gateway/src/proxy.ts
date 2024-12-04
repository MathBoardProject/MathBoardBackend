import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import { Router } from 'express';
// import { makeValidator, string, object } from 'valibot';
import axios from "axios";

import logger from "./logger";

const router = Router();

router.post("/*", async (req, res) => {
    try {
        const target = req.originalUrl;
        const serverPORT = process.env.SERVER_PORT;

        console.log("Request Details:", {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
          });

        const response = await axios.post(`http://localhost:${serverPORT}${target}`, req.body, {
            headers: {
                ...req.headers,
                'Content-Type': 'application/json',
            },
        });

        console.log("RESPONSE DATA : ", response);

        res.status(response.status).json(response.data);
    } catch (err) {
        if (axios.isAxiosError(err)) {
            res.status(err.response?.status || 500)
                .json({ error: "Request blocked on gateway.", details: err });
        } else {
            res.status(500)
                .json({ error: "Unknown error occured", details: `${(err as Error).message}` });
        }

        logger.error("Error Occured", {
            message: (err as Error).message,
            stack: (err as Error).stack,
        });
    }
});

export default router;