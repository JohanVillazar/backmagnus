import express from "express";
import { createCustomer } from "../controllers/customers.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post('/create', authMiddleware, adminMiddleware, createCustomer);

export default router;