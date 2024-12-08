import mariadb from "mariadb";
import logger from "../logger";

class PoolConnection {
    protected connection: mariadb.Connection | null = null;

    constructor(
        private host: string,
        private port: number,
        private user: string,
        private password: string,
        private database: string,
    ) { }

    async connect() {
        if (!this.connection) {
            this.connection = await mariadb.createConnection({
                host: this.host,
                port: this.port,
                user: this.user,
                password: this.password,
                database: this.database,
            })
        }
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