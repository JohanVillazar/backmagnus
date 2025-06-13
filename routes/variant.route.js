import express from "express";
import { createVariant, getAllVariants,UpdateStock,getEnumUnits } from "../controllers/variant.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createVariant);
router.get('/all', authMiddleware, adminMiddleware, getAllVariants);
router.put('/:id/update-stock', authMiddleware, adminMiddleware, UpdateStock);
router.get('/units', authMiddleware, getEnumUnits);

export default router;