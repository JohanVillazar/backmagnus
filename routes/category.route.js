import express from "express";
import { createCategory, getCategories } from "../controllers/category.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createCategory);
router.get('/all', authMiddleware, adminMiddleware, getCategories);

export default router;