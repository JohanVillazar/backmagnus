import { DataTypes } from "sequelize";
import  sequelize  from "../config/db.js";

 const Combo = sequelize.define("Combo", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
},

{

    tableName: "Combo", // Opcional: Puedes asegurarte de que el nombre sea exacto
   
}

);

export default Combo;