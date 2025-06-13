import express from "express";
import {createOrderForTable ,addProductsToExistingOrder,closeOrderAndGenerateSale,getActiveOrderByTable} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createOrderForTable);
router.post('/edit', authMiddleware, adminMiddleware, addProductsToExistingOrder);
router.post('/close', authMiddleware, adminMiddleware, closeOrderAndGenerateSale);
router.get('/table/:tableId', authMiddleware, adminMiddleware, getActiveOrderByTable);

export default router;