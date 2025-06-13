import DataTypes from "sequelize";
import sequelize from "../config/db.js";

const CashRegisterProduct = sequelize.define("CashRegisterProduct", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cashRegisterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "casRegister",
        key: "id",
      },
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "ProductVariant",
        key: "id",
      },
    },
    initialQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    receivedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    soldQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    consumedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    damagedQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    finalQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    }
  }, {
    tableName: "CashRegisterProduct",
    timestamps: true,
  });

  export default CashRegisterProduct