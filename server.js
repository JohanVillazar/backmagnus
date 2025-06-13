import  force  from 'sequelize/lib/index-hints';
import app from './app.js';
import {sequelize} from './models/index.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
     
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}` );
      });
    } catch (error) {
      console.error("❌ Error al iniciar el servidor:", error);
    }
  };
  
  startServer();