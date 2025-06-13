import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Customers = sequelize.define("Customers", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
   name:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true

    },
    dni:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false,
    }
  
},
{
   
    tableName: "Customers", // Opcional: Puedes asegurarte de que el nombre sea exacto
    timestamps: false
  }
);

export default Customers;