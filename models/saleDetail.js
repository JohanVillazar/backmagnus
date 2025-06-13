import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const SaleDetail = sequelize.define("saleDetail", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    saleId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variantId: { // Producto vendido (variante específica)
      type: DataTypes.UUID,
      allowNull: true,
    },
    comboId: {
    type: DataTypes.UUID,
    allowNull: true  // ✅ nuevo campo para combos
  },
    quantity: { // Cantidad vendida
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitPrice: { // Precio unitario en ese momento
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: { // Subtotal (quantity * unitPrice)
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },

  {
   
    tableName: "saleDetail",
    freezeTableName: true,
    timestamps: false
  }
);
  
  export default SaleDetail;
  