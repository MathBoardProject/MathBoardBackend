import mariadb from "mariadb";
import logger from "../logger";

class PoolConnection {
    protected connection: mariadb.Connection | null = null;

    constructor(
        protected host: string,
        protected port: number,
        protected user: string,
        protected password: string,
        protected database: string,
    ) { }

    async connect() {
        try {
            if (!this.connection) {
                this.connection = await mariadb.createConnection({
                    host: this.host,
                    port: this.port,
                    user: this.user,
                    password: this.password,
                    database: this.database,
                });
            }

            this.initializeDB();

        } catch (err) {
            logger.error("Error during DB connection.", { error: err });
            await this.close()
        }
    }

    async initializeDB() {
        if (!this.connection) {
            logger.error("Cannot initialize DB, no connection established.");
        }
        try {
            const query = `CREATE DATABASE IF NOT EXISTS ${this.database}`;
            await this.connection?.query(query);
        } catch (err) {
            logger.error("Error during initializing DB", { error: err });
        }
    }

    async initializeTables() {

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

export default PoolConnection;