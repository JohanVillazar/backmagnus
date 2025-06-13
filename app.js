import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.router.js";
import categoryRouter from "./routes/category.route.js";
import supplierRouter from "./routes/suppliers.route.js";
import customersRouter from "./routes/customers.route.js";
import productRouter from "./routes/products.router.js";
import variantRouter from "./routes/variant.route.js";
import cashRouter from "./routes/cash.router.js";
import saleRouter from "./routes/sale.router.js";
import saleDetailRouter from "./routes/saledetail.router.js";
import sucursalRouter from "./routes/sucursal.route.js";
import purchaseRouter from "./routes/purchase.router.js";
import tableRouter from "./routes/table.router.js";
import orderRouter from "./routes/order.router.js";
import cors from "cors";
import comboRouter from "./routes/combo.routes.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRouter);
app.use('/api/category', categoryRouter);
app.use('/api/suppliers', supplierRouter);
app.use('/api/customers', customersRouter);
app.use('/api/products', productRouter);
app.use('/api/variant', variantRouter);
app.use('/api/cash', cashRouter);
app.use('/api/sale', saleRouter);
app.use('/api/saledetail', saleDetailRouter); 
app.use('/api/sucursal', sucursalRouter);
app.use('/api/purchase', purchaseRouter);
app.use('/api/table', tableRouter);
app.use('/api/order', orderRouter);
app.use('/api/combo', comboRouter);


app.get('/', (req, res) => {
    res.send('API funcionando');
  });
  
  export default app;