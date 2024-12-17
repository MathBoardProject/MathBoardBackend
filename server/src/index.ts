import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import express from "express";
import cors from "cors";

import routes from "./routes";
import getPool from "./database/poolConnection";
import logger from "./logger";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD) {
    logger.error("Missing essential .env variables");
    process.exit(1);
}

const pool = getPool("mathBoard", DB_HOST, Number(DB_PORT), DB_USER, DB_PASSWORD);

const PORT: number = Number(process.env.SERVER_PORT) || 4001;

const app = express();

app.use(express.json());

app.use(cors({
    origin: `*`, //DEV
    methods: "GET POST",
}));

app.use(routes);

app.listen(PORT, () => {
    console.log(`The server is running on : ${PORT}`);
});

export default app;
