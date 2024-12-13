import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import logger from "../logger";
import PoolConnection from "./Pool";

const { DB_HOST, DB_USER_PORT = 3306, DB_USER, DB_PASSWORD } = process.env;

function getPool(): PoolConnection {
    if (!DB_HOST || !DB_USER || !DB_PASSWORD) {
        logger.error("No database enviroment variables provided in .ENV file.");        
        process.exit(1);
    }
    
    const pool = new PoolConnection(DB_HOST, Number(DB_USER_PORT), DB_USER, DB_PASSWORD, "mathBoard")
    pool.connect();
    return pool;
}

export default getPool;