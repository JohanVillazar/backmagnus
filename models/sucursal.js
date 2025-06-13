import express from "express";
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Sucursal = sequelize.define("Sucrusal", {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name :{
        type: DataTypes.STRING,
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    phone:{
        type:DataTypes.STRING,
        allowNull:false
    },
    address:{
        type:DataTypes.STRING,
        allowNull:false
    },
    city:{
        type:DataTypes.STRING,
        allowNull:false
    },
    manager:{
        type:DataTypes.STRING,
        allowNull:false
    }

},
{   tableName: "Sucursal",
    freezeTableName : true, 
    timestamps: true
}
);

export default Sucursal;

