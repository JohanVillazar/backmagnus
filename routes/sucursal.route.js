import express from "express";
import sequelize from "../config/db.js";
import {createSucursal,getAllSucursales} from "../controllers/sucursal.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createSucursal);
router.get('/all', authMiddleware, getAllSucursales);

export default router;