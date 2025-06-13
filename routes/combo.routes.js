import express from "express";
import { setComboComponents,createCombo,getAllCombos, getComboItems } from "../controllers/combo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();



router.post("/combos/:comboVariantId/components", authMiddleware, adminMiddleware, setComboComponents);
router.post("/create", authMiddleware, adminMiddleware, createCombo);
router.get("/all", authMiddleware, adminMiddleware, getAllCombos);
router.get("/items/", authMiddleware, adminMiddleware, getComboItems);

export default router;


