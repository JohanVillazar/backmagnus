import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Users = sequelize.define('Users', {
  id: {
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
},
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName:{
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  phone:{
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user' // o 'admin'
  }
},
{
   
    tableName: "Users", // Opcional: Puedes asegurarte de que el nombre sea exacto
    timestamps: false
  }
);

export default Users;