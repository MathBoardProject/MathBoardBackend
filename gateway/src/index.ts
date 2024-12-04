import "dotenv/config";
import express from "express";

import proxyRoutes from "./proxy";

const app = express();

app.use(express.json());

app.use('/api', proxyRoutes);

const PORT = process.env.GATEWAYPORT || 3001;
app.listen(PORT, ()=>{
    console.log(`Gateway is listening on port : ${PORT}`);
});