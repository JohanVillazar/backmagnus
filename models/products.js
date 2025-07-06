import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Category from "./Category.js";
import Suppliers from "./suppliers.js";


const Products = sequelize.define("Products", {
     id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
   },
   SucursalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
         model: 'Sucursal', // Asegúrate que coincide con el nombre de la tabla
         key: 'id',
      },
   },
     name:{
        type: DataTypes.STRING,
        allowNull: false
     },
     description:{
        type: DataTypes.STRING,
        allowNull: false
     },
     categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Category,
          key: 'id'
        }
      },
     supplierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: Suppliers,
          key: 'id'
        }
      },
   
     },

     {
   
        tableName: "Products", // Opcional: Puedes asegurarte de que el nombre sea exacto
        timestamps: false
      }
    );

export default Products
