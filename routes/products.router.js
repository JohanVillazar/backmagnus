import express from "express";
import { createProduct } from "../controllers/products.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createProduct);

export default router;