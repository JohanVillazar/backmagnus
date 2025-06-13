import { DataTypes } from "sequelize";
import  sequelize from "../config/db.js";


 const ComboComponent = sequelize.define("ComboComponent", {
  comboId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
},

{

    tableName: "ComboComponent", // Opcional: Puedes asegurarte de que el nombre sea exacto
   
}

);

export default ComboComponent