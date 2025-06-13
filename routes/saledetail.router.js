import express from "express";
import { createSaleDetail,} from "../controllers/saledetail.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createSaleDetail);

export default router;