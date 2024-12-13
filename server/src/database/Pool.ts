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

            await this.connection?.query(`USE ${this.database}`);

            const queryBoards = `CREATE TABLE IF NOT EXISTS boards(
                id INT AUTO_INCREMENT NOT NULL UNIQUE,
                ownerId INT NOT NULL,
                boardName VARCHAR(40) NOT NULL
            );`;
            this.connection?.query(queryBoards);

            const queryStrokes = `CREATE TABLE IF NOT EXISTS strokes(
                id INT AUTO_INCREMENT NOT NULL UNIQUE,
                boardId INT NOT NULL,
                SVG TEXT NOT NULL
            )`;

            await this.connection?.query(queryStrokes);
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
        await this.connection?.query(query);
    }

    async createBoard(ownerId: string, boardName: string) {
        try {
            const query = `INSERT INTO ${this.database} (ownerId, boardName) VALUES (?,?)`;
            await this.connection?.query(query, [ownerId, boardName]);
        } catch (err) {
            logger.error("Error during board insertion:", err);
        }
    }

    async getStrokes(boardId: number) {
        const query = `SELECT * FROM strokes WHERE boardId = ?`
        const [rows, fields] = await this.connection?.query(query, [boardId]);
        return rows;
    }
}

export default PoolConnection;