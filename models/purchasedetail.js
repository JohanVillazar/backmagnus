import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Purchase from "./purchase.js";
import productVariant from "./productVariant.js";

export const PurchaseDetail = sequelize.define('PurchaseDetail', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    purchaseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Purchase,
            key: 'id'
        }
    },
    productVariantId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: productVariant,
            key: 'id'
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
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
});

export default PurchaseDetail
