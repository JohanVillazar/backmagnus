import sequelize from "../config/db.js";
import Table from "./table.js";
import Users from "./Users.js";
import { DataTypes } from "sequelize";


const Order = sequelize.define("Order", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tableId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Table,
        key: "id"
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false, // opcional
      references: {
        model: Users,
        key: "id"
      }
    },
    cashRegisterId: {
      type: DataTypes.UUID,
      allowNull: false, // opcional
    },
    status: {
      type: DataTypes.ENUM("pendiente", "pagado", "cancelado"),
      defaultValue: "pendiente"
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0
    }
  }, {
    tableName: "orders",
    timestamps: true
  });
  
  export default Order;  