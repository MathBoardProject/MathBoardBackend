import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import express from "express";
import session from "express-session";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { createServer } from "http";

import routes from "./routers/routes";

import getPool from "./database/poolConnection";
import logger from "./logger";

//Setup
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD) {
    logger.error("Missing essential .env variables. Please check .env file");
    process.exit(1);
}



const PORT: number = Number(process.env.SERVER_PORT) || 4001;

//App
const app = express();

app.use(express.json());

app.use(cors({
    origin: `*`, //DEV
    methods: "GET POST",
}));

app.use(session({
    secret: process.env.SESSION_SECRET || "session-secret",
    saveUninitialized: true,
    resave: false,
    cookie: {
        secure: false, // Only set 'secure' to true in production for HTTPS
        httpOnly: true,
    }
}));

app.use("/strokes", routes); //edit DEV

app.listen(PORT, () => {
    console.log(`The server is running on : ${PORT}`);
});

export default app;