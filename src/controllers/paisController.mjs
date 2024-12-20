import fetch from 'node-fetch'; // Importa node-fetch
import { connectDB } from '../config/dbConfig.mjs'; // Importa la función connectDB como exportación nombrada
import Pais from '../models/pais.mjs'; // Importa el modelo de País
import { validarPais } from '../validators/paisValidator.mjs'; // Importa la función de validación

// Controlador para consumir la API y escribir la base de datos
export const obtenerTodosLosPaisesController = async () => {
  try {
    await connectDB(); // Conectar a la base de datos

    // Verificar si ya existen países en la base de datos
    const paises = await Pais.find();
    if (paises.length > 0) {
      console.log('Ya existen países en la base de datos. No se ejecutará la operación.');
      return;
    }

    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) {
      throw new Error('Error al obtener los países');
    }
    const paisesApi = await response.json();

    // Filtrar los países que tienen "spa" en su propiedad "languages"
    const paisesFiltrados = paisesApi.filter(pais => pais.languages && pais.languages.spa);

    // Mapear los países filtrados para eliminar propiedades no deseadas y agregar el campo "creador"
    const paisesModificados = paisesFiltrados.map(pais => {
      const { translations, tld, cca2, ccn3, cca3, c1oc, idd, altSpellings, car, coatOfArms, postalCode, demonyms, ...resto } = pais;
      return {
        ...resto,
        creador: 'Matias' 
      };
    });

    // Almacenar los países en la base de datos
    await Pais.insertMany(paisesModificados);

    console.log('Países almacenados en la base de datos');
  } catch (error) {
    console.error('Error:', error);
  }
};



// Obtener País por ID
export const obtenerPaisPorId = async (id) => {
  try {
      await connectDB(); // Conectar a la base de datos
      const pais = await Pais.findById(id);
      return pais;
  } catch (error) {
      console.error('Error al obtener el país:', error);
      throw error; // Lanza el error para manejarlo en la ruta
  }
};

// Obtener Países
export const obtenerPaisesDesdeDBController = async (req, res) => {
  try {
      await connectDB(); 
      const paises = await Pais.find({ creador: 'Matias' }); // Filtra por creador

      // Pasa el mensaje flash a la vista
      return res.render('listaPaises', { 
          paises, 
          title: 'Lista de Países', 
          messages: req.flash('success_msg') // Asegúrate de pasar el mensaje
      });
  } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Agregar País
export const agregarPaisController = async (req, res) => {
  try {
      await connectDB(); // Conectar a la base de datos

      const { 
          name, 
          independent, 
          status, 
          unMember, 
          capital, 
          region, 
          subregion, 
          area, 
          population, 
          flag, 
          borders, 
          languages, 
          timezones 
      } = req.body;

      // Accede al nombre 
      const nombreOficial = name.nativeName?.spa?.official;

      // Validaciones
      const errores = validarPais(req.body); // Llama a la función de validación

      // Si hay errores, renderiza la vista del formulario con los errores
      if (errores.length > 0) {
          return res.render('addPais', { 
              errores, // Pasa los errores a la vista
              datos: req.body, // Pasa los datos ingresados para que el usuario no tenga que volver a escribirlos
              title: 'Agregar País' // Título de la página
          });
      }

      // Procesa los idiomas como un objeto
      const idiomasArray = languages ? languages.split(',').map(idioma => idioma.trim().toUpperCase()) : [];
      const idiomasObject = {};
      idiomasArray.forEach(idioma => {
          idiomasObject[idioma.toLowerCase()] = true; // O puedes asignar el nombre del idioma si lo prefieres
      });

      // Crea un nuevo país
      const nuevoPais = new Pais({
          name: {
              common: name.common || '', 
              official: nombreOficial || '', 
              nativeName: {
                  spa: {
                      official: nombreOficial || '' 
                  }
              }
          },
          independent: independent || false ,
          status: status || '',
          unMember: unMember || false,
          capital: capital, // Asegúrate de que capital sea un array
          region,
          subregion,
          area: Number(area), // Asegúrate de que el área sea un número
          population: parseInt(population, 10), // Asegúrate de que la población sea un número entero
          flag,
          borders: borders ? borders.split(',').map(b => b.trim().toUpperCase()) : [], // Procesa las fronteras
          languages: idiomasObject, // Guarda los idiomas como objeto
          timezones, // Asegúrate de que este campo esté bien estructurado
          creador: "Matias" // Asigna tu nombre como creador
      });

      // Guarda el nuevo país en la base de datos
      await nuevoPais.save();
      req.flash('success_msg', 'País agregado correctamente');
      // Redirige a la lista de países después de agregar
      res.redirect('/paises');
  } catch (error) {
      console.error('Error al agregar país:', error);
      res.status(500).send('Error al agregar país');
  }
};

// Muestra el formulario de edicion
export const editarPaisController = async (req, res) => {
  const paisId = req.params.id;
  try {
      const pais = await obtenerPaisPorId(paisId);
      if (!pais) {
          return res.status(404).send('País no encontrado');
      }
      res.render('editPais', { title: 'Editar País', pais, errores: [] });
  } catch (error) {
      res.status(500).send('Error al obtener el país');
  }
};

// Actualizar País
export const actualizarPaisController = async (req, res) => {
  const paisId = req.params.id;
  try {
      await connectDB(); // Conectar a la base de datos

      // Obtén los datos del formulario
      const { name, capital, borders, area, population, timezones, region, languages } = req.body;

      // Procesa los idiomas como un objeto
      const idiomasArray = languages ? languages.split(',').map(idioma => idioma.trim().toLowerCase()) : [];
      const idiomasObject = {};
      idiomasArray.forEach(idioma => {
          idiomasObject[idioma] = true; // Guarda los idiomas como un objeto
      });

      // Validaciones
      const errores = validarPais(req.body); // Llama a la función de validación

      // Si hay errores, renderiza la vista de edición con los errores
      if (errores.length > 0) {
          const pais = await obtenerPaisPorId(paisId); // Obtén el país para volver a mostrarlo en el formulario
          return res.render('editPais', { title: 'Editar País', pais, errores });
      }

      // Si el campo borders está vacío, asigna "No tiene fronteras"
      const bordersArray = borders && borders.trim() !== "" 
          ? borders.split(',').map(b => b.trim().toUpperCase()) 
          : ["No tiene fronteras"];

      // Actualiza el país en la base de datos
      await Pais.findByIdAndUpdate(paisId, {
          name: {
              common: name.common, 
              official: name.official,
              nativeName: name.nativeName 
          },
          capital: Array.isArray(capital) ? capital : [capital], 
          borders: bordersArray, 
          area: Number(area), 
          population: parseInt(population, 10), 
          timezones: Array.isArray(timezones) ? timezones : timezones.split(',').map(t => t.trim()), 
          region,
          languages: idiomasObject 
      });

      req.flash('success_msg', 'País actualizado correctamente');
      res.redirect('/paises'); // Redirige a la lista de países después de actualizar
  } catch (error) {
      console.error('Error al actualizar país:', error);
      res.status(500).send('Error al actualizar país');
  }
};

// Eliminar País
export const eliminarPaisController = async (req, res) => {
  const paisId = req.params.id;
  try {
      await connectDB(); // Conectar a la base de datos
      await Pais.findByIdAndDelete(paisId); // Eliminar el país por ID
      req.flash('success_msg', 'País eliminado correctamente'); // Mensaje de éxito
      res.redirect('/paises'); // Redirigir a la lista de países
  } catch (error) {
      console.error('Error al eliminar país:', error);
      res.status(500).send('Error al eliminar país');
  }
};


