import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderDetail = sequelize.define("OrderDetail", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    comboId:{
      type: DataTypes.UUID,
      allowNull: true,
      references: {
      model: "Combo", // asegúrate que coincide con tu tabla real
      key: "id"
    }

    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: "order_details",
    timestamps: true
  });
  
  export default OrderDetail;  