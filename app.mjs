import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';
import expressLayouts from 'express-ejs-layouts';
import methodOverride from 'method-override';
import { obtenerPaisesDesdeDBController, agregarPaisController,editarPaisController,actualizarPaisController,eliminarPaisController } from './src/controllers/paisController.mjs';
import { obtenerTodosLosPaisesController } from './src/controllers/paisController.mjs'; // Importa el controlador

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Middleware method-override
app.use(methodOverride('_method'));

// Configuración de EJS como motor de plantillas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Usa el middleware de layouts
app.use(expressLayouts);

// Llama al controlador para obtener todos los países
obtenerTodosLosPaisesController().then(() => {
  console.log('Operación completa');
}).catch((error) => {
  console.error('Error:', error);
});

// Configura el middleware de sesión
app.use(session({
    secret: 'tu_secreto', // Cambia esto por un secreto más seguro
    resave: false,
    saveUninitialized: true
}));

// Configura el middleware de flash
app.use(flash());

// Rutas
app.get('/paises', obtenerPaisesDesdeDBController);
app.get('/addPais', (req, res) => {
    res.render('addPais', { errores: [], datos: {}, title: 'Agregar País' });
});
app.post('/pais', agregarPaisController);
app.get('/', (req, res) => {
  res.render('index', { title: 'Inicio' });
});
// Ruta para mostrar el formulario de edición de un país
app.get('/editPais/:id', editarPaisController); // Usa el controlador para editar
app.put('/pais/:id', actualizarPaisController);
app.delete('/pais/:id', eliminarPaisController); // Ruta para eliminar un país
// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

