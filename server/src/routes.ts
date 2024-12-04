import { Router } from "express";
import express from "express";

const router = Router();

router.use(express.json())

router.post("/api", (req, res) => {
    console.log("/api requested, RES.Body : ");
    res.json({ message: "Hello from server !" });
});

export default router;