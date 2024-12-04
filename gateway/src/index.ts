import dotenv from "dotenv";
import path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

import express from "express";

import router from "./proxy";

const app = express();

app.use(express.json());
app.use(router);

const PORT = process.env.GATEWAY_PORT || 3001;
app.listen(PORT, () => {
    console.log(`Gateway is listening on port : ${PORT}`);
});