import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import getPool from "../src/database/poolConnection";
import PoolConnection from "../src/database/Pool";
import * as dbInterfaces from "../src/database/db";
import logger from "../src/logger";

const dbname = "mathBoardTest";

describe("Boards is initialised and works correctly", () => {
    let pool: PoolConnection;
    beforeAll(() => {
        const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD } = process.env;

        if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD) {
            logger.error("No .env data while attempt to run the tests");
            process.exit(1);
        }
        pool = getPool(dbname, DB_HOST, Number(DB_PORT), DB_USER, DB_PASSWORD);
    });

    afterAll(async () => {
        pool.queryDB(`DROP DATABASE ${dbname}`);
        await pool.close();
    });

    test("Board info is able to get", async () => {
        const [boardName, userId] = ["board1", 1];

        await pool.insertBoard(1, boardName);
        const boards: dbInterfaces.board[] = await pool.getBoard(1);

        console.log("boards :", boards);

        expect(boards.some(element => element.ownerId === userId)).toBe(true);
        expect(boards[0].boardName).toEqual(boardName);
    });

    test("Strokes are able to be selectet by board id", async () => {
        const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><path d="M 10 10 L 190 190" stroke="black" stroke-width="5" fill="none" /></svg>`;
        const [boardId, x, y] = [1, 0, -10];
        await pool.insertStroke(boardId, svg1, x, y);

        const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><path d="M 10 10 L 190 190" stroke="black" stroke-width="5" fill="none" /></svg>`;
        await pool.insertStroke(boardId, svg2, x, y);

        const response: dbInterfaces.stroke[] | undefined = await pool.getAllStrokes(boardId);
        if (response) {
            const [stroke1, stroke2] = response;
            const expStroke1 = {
                id: 1,
                boardId: 1,
                svg: svg1,
                x: x,
                y: y,
            }
            const expStroke2 = {
                id: 2,
                boardId: 1,
                svg: svg1,
                x: x,
                y: y,
            }
            expect(stroke1).toEqual(expStroke1);
            expect(stroke2).toEqual(expStroke2);
        }
    })
});