import mariadb from "mariadb";
import logger from "../logger";

class PoolConnection {
    protected connection: mariadb.Pool | null = null;

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
                this.connection = mariadb.createPool({
                    host: this.host,
                    port: this.port,
                    user: this.user,
                    password: this.password,
                    connectionLimit: 10,
                });
            }
            this.initializeDB();
            console.log("Connection went successful");
        } catch (err) {
            logger.error("Error during DB connection.", { error: err });
            await this.close()
        }
    }

    async initializeDB() {
        console.log("Initialization started !");
        if (!this.connection) {
            logger.error("Cannot initialize DB, no connection established.");
        }
        try {
            const queryDB = `CREATE DATABASE IF NOT EXISTS ${this.database};`;
            console.log(queryDB);
            await this.connection?.query(queryDB);

            this.connection?.query(`USE ${this.database}`);

            const queryBoardsTable = `CREATE TABLE IF NOT EXISTS boards(
                id INT AUTO_INCREMENT NOT NULL UNIQUE,
                ownerId INT NOT NULL,
                boardName VARCHAR(40) NOT NULL
            );`;
            this.connection?.query(queryBoardsTable);
            console.log("DB created !");
        } catch (err) {
            logger.error("Error during initializing DB", { error: err });
        }
    }

    async close() {
        try {
            if (this.connection) {
                await this.connection.end();
                this.connection = null;
                console.log("Pool conection closed succesfuly");
            } else {
                console.log("Failed to close pull connection");
            }
        } catch (error) {
            const err = (error as Error);
            logger.error("Error during DB close", {
                message: err.message,
                stack: err.stack,
            });
        }
    }

    async queryDB(query: string) {
        this.connection?.query(query);
    }

    async createBoard(ownerId: string, boardName: string) {
        try {
            const query = `INSERT INTO ${this.database} (ownerId, boardName) VALUES (?,?)`;
            this.connection?.query(query, [ownerId, boardName]);
        } catch (err) {
            logger.error("Error inserting board:", err);
        }
    }
}

export default PoolConnection;