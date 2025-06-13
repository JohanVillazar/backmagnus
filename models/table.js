import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
const Table = sequelize.define("Table", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
     location:{
      type: DataTypes.STRING,
      allowNull: false

    },
    seats:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM("disponible", "ocupada", "reservada"),
      defaultValue: "disponible"
    }
  }, {
    tableName: "tables",
    timestamps: true
  });
  
  export default Table;