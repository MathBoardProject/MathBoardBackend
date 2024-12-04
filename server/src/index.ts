import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import express from "express";
import cors from "cors";

import routes from "./routes";

const PORT: number = Number(process.env.SERVER_PORT) || 4001;
const GatewayPORT = Number(process.env.GATEWAY_PORT) || 3001;

const app = express();

app.use(express.json());

app.use(cors({
    origin: `http://localhost:${GatewayPORT}`,
    methods: "GET POST",
}));

app.use(routes);

app.listen(PORT, () => {
    console.log(`The server is running on : ${PORT}`);
});

export default app;