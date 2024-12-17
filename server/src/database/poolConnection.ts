import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import logger from "../logger";
import PoolConnection from "./Pool";

function getPool(dbName: string, host: string, port: number = 3306, user: string, password: string): PoolConnection {
    if (!host || !user || !password) {
        logger.error("No database enviroment variables provided in .ENV file.");
        process.exit(1);
    }

    const pool = new PoolConnection(host, Number(port), user, password, dbName);
    pool.connect();
    return pool;
}

export default getPool;