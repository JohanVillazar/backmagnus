import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";


const CashRegister = sequelize.define("cashRegister", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID, // Usuario que abrió la caja
      allowNull: false,
    },
    openingAmount: { // Dinero base
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },
    totalSales: { // Total de ventas generadas
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0,
    },
    totalIncome: { // Ingresos extra (aportes)
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0,
    },
    totalWithdrawals: { // Retiros (gastos)
      type: DataTypes.DECIMAL(10,2),
      defaultValue: 0,
    },
    closingAmount: { // Total al cerrar la caja
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
    },
    status: { // Estado de la caja
      type: DataTypes.ENUM("open", "closed"),
      defaultValue: "open",
    },
    openedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
   
    tableName: "casRegister",
    freezeTableName: true, 
    timestamps: false
  }

);
  
  export default CashRegister;