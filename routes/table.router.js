import express from "express";
import { createTable,getAllTables,reserveTable } from "../controllers/table.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createTable);
router.get('/all', authMiddleware, getAllTables);
router.patch('/:id/reserve', authMiddleware, adminMiddleware, reserveTable);

export default router;