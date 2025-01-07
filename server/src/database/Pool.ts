import mariadb from "mariadb";
import logger from "../logger";
import { readFileSync } from "fs";
import path from "path";

import * as dbInterfaces from "./db";

const [queryStrokes, queryBoards] = [
    String(readFileSync(path.join(__dirname, "../../queries/strokesInit.sql"))),
    String(readFileSync(path.join(__dirname, "../../queries/boardsInit.sql"))),
];

class PoolConnection { //check if name is accurate DEV
    protected pool: mariadb.Pool | null = null;
    protected connection: mariadb.Connection | null = null;

    constructor(
        protected host: string | undefined,
        protected port: number | undefined,
        protected user: string | undefined,
        protected password: string | undefined,
        protected database: string | undefined,
    ) {
        if (!this.host || !this.host || !this.user || !this.password || !this.database) {
            logger.error("No database enviroment variables provided in .ENV file.");
            process.exit(1);
        }
    }

    async connect(initDB = true) {
        try {
            if (!this.host || !this.host || !this.user || !this.password || !this.database) {
                logger.error("No database enviroment variables provided in .ENV file.");
                process.exit(1);
            }
            if (!this.pool) {
                this.pool = mariadb.createPool({
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
            logger.error("Error during DB connection, check if mariadb is running.", { error: err });
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

    //Helper functions
    createPlaceholders(array: number[]) {
        return array.map(() => "?").join(", ");
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

    async loadBoard(boardId: number): Promise<dbInterfaces.stroke[] | undefined> {
        try {
            const query = `SELECT id, boardId, svg, x, y FROM strokes WHERE boardId = ?;`;
            const response: dbInterfaces.stroke[] | undefined = await this.connection?.query(query, [boardId]);
            return response;
        } catch (err) {
            logger.error(err);
        }
    }

    //Strokes operations
    async pushStrokes(boardId: number, svg: string[], x: number[], y: number[]) { //edit it for multi push same as bottom one
        try {
            if (svg.length !== (x.length + y.length) / 2) { //checks if the length of every args is the same.
                throw new Error("Length of arguments is not equal while inserting Stokes.");
            }
            const placeholders = x.map(() => { "?, ?, ?, ?" }).join(", ");
            const query = `INSERT INTO strokes (boardId, svg, x, y) VALUES (${placeholders});`;
            const values = svg.flatMap((stroke, index) => [boardId, stroke, x[index], y[index]]);
            await this.connection?.query(query, values);
        } catch (err) {
            logger.error("Error during db insertStroke", err);
        }
    }

    async pullStrokes(boardId: number, idList: number[]) {
        try {
            const placeholders = this.createPlaceholders(idList);
            const query = `SELECT * FROM strokes WHERE boardId = ? AND id IN (${placeholders})`;
            const strokes: dbInterfaces.stroke[] | undefined = await this.connection?.query(query, [boardId, ...idList]);
            return strokes;
        } catch (err) {
            logger.error("Error during db pullStroke", err);
        }
    }

    async deleteStrokes(boardId: number, idList: number[]) {
        try {
            const placeholders = this.createPlaceholders(idList);
            const query = `DELETE FROM strokes WHERE boardId = ? AND id IN (${placeholders})`;
            const strokes: dbInterfaces.stroke[] | undefined = await this.connection?.query(query, [boardId, ...idList]);
            return strokes;
        } catch (err) {
            logger.error("Error during db deleteStrokes", err);
        }
    }
}

export default PoolConnection;

//Think about being able to give user option to change the name of the tables or at least db name in .env file
//Improve safety