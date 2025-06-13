import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Suppliers = sequelize.define("Suppliers", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    Nit:{
        type: DataTypes.STRING,
        allowNull: false
    },
    company:{
        type: DataTypes.STRING,
        allowNull: false
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false
    },
    phone:{
        type: DataTypes.STRING,
        allowNull: false
    },email:{
        type: DataTypes.STRING,
        allowNull: false
    }
  
},
{
   
    tableName: "Suppliers", // Opcional: Puedes asegurarte de que el nombre sea exacto
    timestamps: false
  }
);

export default Suppliers;