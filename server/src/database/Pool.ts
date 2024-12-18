import mariadb from "mariadb";
import logger from "../logger";
import { readFileSync } from "fs";
import path from "path";

import * as dbInterfaces from "./db";

console.log("PATH:", path.join(__dirname, "./queries/databaseInit.sql"))

const [queryStrokes, queryBoards] = [
    // `CREATE DATABASE IF NOT EXISTS $ { this.database };`, // dev
    String(readFileSync(path.join(__dirname, "./queries/strokesInit.sql"))),
    String(readFileSync(path.join(__dirname, "./queries/boardsInit.sql")))
];

class PoolConnection {
    protected pool: mariadb.Pool | null = null;
    protected connection: mariadb.Connection | null = null;

    constructor(
        protected host: string,
        protected port: number,
        protected user: string,
        protected password: string,
        protected database: string,
    ) { }

    async connect(initDB = true) {
        try {
            if (!this.pool) {
                this.pool = mariadb.createPool({ //stops jest from exiting app
                    host: this.host,
                    port: this.port,
                    user: this.user,
                    password: this.password,
                    connectionLimit: 10,
                });
            }
            this.connection = await this.pool.getConnection();

            if (initDB) {
                await this.connection?.query(`CREATE DATABASE IF NOT EXISTS $ { this.database };`); //Dev

                await this.connection?.query(`USE ${this.database}`);

                await this.connection?.query(queryBoards);
                await this.connection?.query(queryStrokes);
            }
        } catch (err) {
            logger.error("Error during DB connection.", { error: err });
            await this.close()
        }
    }

    async close() {
        try {
            if (this.connection || this.pool) {
                this.connection?.end();
                this.connection = null;

                this.pool?.end();
                this.pool = null;

                logger.info("Pool and connection to db closed successfuly");
            }
        } catch (error) {
            const err = (error as Error);
            logger.error("Error during DB close", {
                message: err.message,
                stack: err.stack,
            });
        }
    }

    async query(query: string) {
        try {
            const response = this.connection?.query(query);
            return response;
        } catch (err) {
            logger.error(err);
        }
    }

    //Insertion
    async insertBoard(ownerId: number, boardName: string) {
        try {
            const query = `INSERT INTO boards (ownerId, boardName) VALUES (?, ?);`;
            await this.connection?.query(query, [ownerId, boardName]);
            console.log(`Board "${boardName}" inserted successfully for ownerId: ${ownerId}`);
        } catch (err) {
            logger.error("Error during board insertion:", err);
        }
    }

    async insertStroke(boardId: number, svg: string, x: number, y: number) {
        try {
            const query = `INSERT INTO strokes (boardId, svg, x, y) VALUES (?,?,?,?);`;
            await this.connection?.query(query, [boardId, svg, x, y]);
        } catch (err) {
            logger.error(err);
        }
    }

    //Accessors
    async getBoard(boardId: number): Promise<dbInterfaces.board[] | undefined> {
        try {
            const query = `SELECT * FROM boards WHERE id = ?;`;
            const response = await this.connection?.query(query, [boardId]);
            return response;
        } catch (err) {
            logger.error(err);
        }
    }

    async getAllStrokes(boardId: number): Promise<dbInterfaces.stroke[] | undefined> {
        try {
            const query = `SELECT id, boardId, svg, x, y FROM strokes WHERE boardId = ?;`;
            const response: dbInterfaces.stroke[] | undefined = await this.connection?.query(query, [boardId]);
            return response;
        } catch (err) {
            logger.error(err);
        }
    }
}

export default PoolConnection;