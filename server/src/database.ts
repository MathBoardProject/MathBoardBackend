import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import { createConnection, Connection } from "mysql2";
import logger from "./logger";

class databaseConnection {
    private connection: Connection | null = null;

    constructor(
        private host: string,
        private user: string,
        private password: string,
        private database: string,
    ) {
        (async () => { //Database connection establishment
            if (!this.connection) {
                this.connection = createConnection({
                    host: this.host,
                    user: this.user,
                    password: this.password,
                    database: this.database,
                })
            }
        })();
    }

    async close() {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
            }
        } catch (error) {
            const err = (error as Error);
            logger.error("Error during DB close", {
                message: err.message,
                stack: err.stack,
            });
        }
    }
}