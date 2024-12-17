import mariadb from "mariadb";
import logger from "../logger";

import * as dbInterfaces from "./db";

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
            await this.initializeDB();

            logger.info(`Connected to DB: ${this.database}`);
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
            const queryDB = `CREATE DATABASE IF NOT EXISTS ${this.database};`;
            await this.connection?.query(queryDB);

            console.log(`Querying : USE ${this.database};`);

            const queryBoards = `CREATE TABLE IF NOT EXISTS boards(
                id INT AUTO_INCREMENT NOT NULL UNIQUE,
                ownerId INT NOT NULL,
                boardName VARCHAR(40) NOT NULL
            );`;

            await this.connection?.query(queryBoards);

            const queryStrokes = `CREATE TABLE IF NOT EXISTS strokes(
                id INT AUTO_INCREMENT NOT NULL UNIQUE,
                boardId INT NOT NULL,
                svg TEXT NOT NULL,
                x INT NOT NULL,
                y INT NOT NULL
            );`;

            await this.connection?.query(queryStrokes);
        } catch (err) {
            logger.error("Error during initializing DB", { error: err });
        }
    }

    async close() {
        try {
            if (this.connection) {
                this.connection?.end();
                this.connection = null;
                logger.info("Pool conection closed succesfuly");
            } else {
                logger.error("Failed to close pull connection");
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

    //Insertion
    async insertBoard(ownerId: number, boardName: string) {
        try {
            const query = `INSERT INTO boards (ownerId, boardName) VALUES (?,?);`;
            await this.connection?.query(query, [ownerId, boardName]);
        } catch (err) {
            logger.error("Error during board insertion:", err);
        }
    }

    async insertStroke(boardId: number, svg: string, x: number, y: number) {
        const query = `INSERT INTO strokes (boardId, svg, x, y) VALUES (?,?,?,?);`;
        await this.connection?.query(query, [boardId, svg, x, y]);
    }

    //Accessors
    async getBoard(boardId: number): Promise<dbInterfaces.board[]> {
        const query = `SELECT * FROM boards WHERE id = ?;`;
        const response = await this.connection?.query(query, [boardId]);
        return response;
    }

    async getAllStrokes(boardId: number): Promise<dbInterfaces.stroke[] | undefined> {
        const query = `SELECT id, boardId, svg, x, y FROM strokes WHERE boardId = ?;`;
        const response: dbInterfaces.stroke[] | undefined = await this.connection?.query(query, [boardId]);
        return response;
    }
}

export default PoolConnection;

//Think if making query interface to store queries and "?" values would be great idea.
//Repair issue with USE db, it needs to be used every query by some reason