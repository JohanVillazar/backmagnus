import express from "express";
import { register, login,getAllUsers } from "../controllers/auth.controller.js";
import {adminMiddleware } from "../middlewares/admin.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);




export default router;