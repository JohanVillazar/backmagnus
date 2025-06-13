import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Sale = sequelize.define("Sale", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reference:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Para evitar duplicados
  },
  cashRegisterId: { // Se asocia a la caja abierta
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: { // Usuario que realizó la venta
    type: DataTypes.UUID,
    allowNull: false,
  },
  customerId:{
    type: DataTypes.UUID,
    allowNull: false
  },
  subtotal:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax:{
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  shippingCost:{
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  totalPrice: { // Total de la venta
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: { // Método de pago (Efectivo, Tarjeta, etc.)
    type: DataTypes.ENUM("efectivo", "tarjeta", "nequi"),
    allowNull: false,
  },
  
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
 
},

{
   
    tableName: "Sale",
    freezeTableName: true,
    
  }

);

export default Sale;
