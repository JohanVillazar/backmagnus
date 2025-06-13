import express from "express";
import { createSupplier, getSuppliers } from "../controllers/suppliers.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createSupplier);
router.get('/all', authMiddleware, adminMiddleware, getSuppliers);

export default router;