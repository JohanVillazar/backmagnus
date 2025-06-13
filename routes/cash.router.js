import express from "express";
import { openCashRegister, closeCashRegister, addIncome , addWithdrawal,
addProductToCashRegister,addStockToCashRegister,registerInternalConsumption,registerProductDamage,
getAllCashRegisters,getCashStatus,getProductsInOpenCash, getAlladdIncome,getAllCashMovements,getCurrentStockMovements,
getLastClosedProducts, getOpenCashSummary
} from "../controllers/cash.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";


const router = express.Router();

router.post('/open', authMiddleware, adminMiddleware, openCashRegister);
router.post('/close', authMiddleware, adminMiddleware, closeCashRegister);
router.post('/add-income', authMiddleware, adminMiddleware, addIncome);
router.post('/add-bills', authMiddleware, adminMiddleware, addWithdrawal);
router.post('/add-product', authMiddleware, adminMiddleware, addProductToCashRegister);
router.post('/add-stock', authMiddleware, adminMiddleware, addStockToCashRegister);
router.post('/internal-consum', authMiddleware, adminMiddleware, registerInternalConsumption);
router.post('/product-damage', authMiddleware, adminMiddleware, registerProductDamage);
router.get('/all', authMiddleware,  getAllCashRegisters);
router.get('/status', authMiddleware,  getCashStatus);
router.get('/products', authMiddleware,  getProductsInOpenCash);
router.get('/income-all', authMiddleware,  getAlladdIncome);
router.get('/movements', authMiddleware,  getAllCashMovements);
router.get('/current-stock', authMiddleware,  getCurrentStockMovements);
router.get('/last-closed', authMiddleware,  getLastClosedProducts);
router.get('/open-summary', authMiddleware,  getOpenCashSummary);

export default router;