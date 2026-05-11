import dns from 'node:dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Importante: En ES Modules es obligatorio incluir la extensión .js al importar archivos locales
import usersRoutes from './routes/users.routes.js';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Configuración de la URI de MongoDB
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('ERROR: La variable MONGO_URI no está definida en el archivo .env');
    process.exit(1);
}

// Conexión a MongoDB con manejo de errores para Atlas
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000 
})
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch((err) => {
    console.error('❌ Error de conexión (DNS/Network):');
    console.error('Mensaje:', err.message);
    console.log('Consejo: Revisa que tu IP esté en la lista blanca de Atlas y que tus DNS sean 8.8.8.8');
});

// Rutas
app.use('/api/users', usersRoutes);

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en: http://localhost:${PORT}`);
});
