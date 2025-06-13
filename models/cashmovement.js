import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CashMovement = sequelize.define("cashMovement", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cashRegisterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("ingreso", "gasto"), // ingreso o retiro
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {

    tableName: "cashMovement", 
    freezeTableName: true,
    timestamps: false
}
);
  
  export default CashMovement;
  