import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import suppliers from "./suppliers.js";
import Sucursal from "./sucursal.js";
import Users from "./Users.js";
import productVariant from "./productVariant.js";

 const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    reference: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    SucursalId: {
         type: DataTypes.UUID,
         allowNull: false,
         references: {
             model: Sucursal,
             key: 'id'
         }
     },
     SupplierId: {
         type: DataTypes.UUID,
         allowNull: false, // o true si puede ser opcional
         references: {
             model: "Suppliers",
             key: "id",
         },
     },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pendiente', 'pagada'),
        defaultValue: 'pendiente'
    }
});

export default Purchase

