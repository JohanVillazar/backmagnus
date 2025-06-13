import express from "express";
import { createSaleWithDetails,getDailySalesSummary} from "../controllers/sale.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { getSalesReport } from "../controllers/sale.controller.js";
import {exportSalesReportPdf,getTopSellingProducts,getWeeklySales} from "../controllers/sale.controller.js";

const router = express.Router();    

router.post('/create', authMiddleware, adminMiddleware, createSaleWithDetails);
router.get('/report', authMiddleware, adminMiddleware, getSalesReport);
router.get('/report/pdf', authMiddleware, adminMiddleware, exportSalesReportPdf);
router.get('/all', authMiddleware, adminMiddleware, getDailySalesSummary);
router.get('/top-products', authMiddleware, getTopSellingProducts);
router.get('/weekly-sales', authMiddleware, getWeeklySales);

export default router;