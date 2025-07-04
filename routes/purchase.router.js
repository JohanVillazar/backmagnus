import express from "express";
import { createPurchase,getPurchaseSummary,getRecentPurchases,updatePurchaseStatus } from "../controllers/purchase.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createPurchase);
router.get('/summary', authMiddleware, getPurchaseSummary);
router.get('/recent', authMiddleware, getRecentPurchases);
router.put('/:id/update-status', authMiddleware, adminMiddleware, updatePurchaseStatus);

export default router;