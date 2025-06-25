import Sequelize from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 20,        // 🔼 aumenta según lo que soporte tu DB
      min: 0,
      acquire: 30000, // ⏳ tiempo máximo para obtener una conexión (ms)
      idle: 10000     // 💤 tiempo antes de liberar una conexión inactiva (ms)
    }
  }
);

export default sequelize;
