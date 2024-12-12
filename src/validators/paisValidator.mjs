// paisValidator.mjs

export const validarNombreOficial = (nombreOficial) => {
  if (typeof nombreOficial !== 'string' || nombreOficial.length < 3 || nombreOficial.length > 90) {
      return 'El nombre oficial debe tener entre 3 y 90 caracteres.';
  }
  return null; // Validación exitosa
};

export const validarCapital = (capital) => {
  if (!Array.isArray(capital) || capital.some(c => typeof c !== 'string' || c.length < 3 || c.length > 90)) {
      return 'Cada capital debe tener entre 3 y 90 caracteres.';
  }
  return null; // Validación exitosa
};

export const validarFronteras = (fronteras) => {
  if (!Array.isArray(fronteras) || fronteras.some(f => typeof f !== 'string' || f.length !== 3 || !/^[A-Z]+$/.test(f))) {
      return 'Cada frontera debe ser una cadena de 3 letras mayúsculas.';
  }
  return null; // Validación exitosa
};

export const validarArea = (area) => {
  if (typeof area !== 'number' || area <= 0) {
      return 'El área debe ser un número positivo.';
  }
  return null; // Validación exitosa
};

export const validarPoblacion = (poblacion) => {
  if (!Number.isInteger(poblacion) || poblacion <= 0) {
      return 'La población debe ser un número entero positivo.';
  }
  return null; // Validación exitosa
};

export const validarIdiomas = (idiomas) => {
  const idiomasValidos = ['SPA', 'ENG', 'FRA', 'DEU', 'AYM', 'QUE', 'GRN', 'CAT', 'EUS', 'GLC', 'BER', 'MEY', 'POR', 'BJZ', 'CHA']; // Lista de idiomas válidos
  for (const idioma of idiomas) {
      if (!idiomasValidos.includes(idioma)) {
          return `El idioma ${idioma} no es válido.`;
      }
  }
  return null; // No hay errores
};

// Nueva función para validar todos los campos
export const validarPais = (data) => {
  const errores = [];
  
  const nombreOficialError = validarNombreOficial(data.name.nativeName?.spa?.official);
  if (nombreOficialError) errores.push(nombreOficialError);

  const capitalError = validarCapital(data.capital);
  if (capitalError) errores.push(capitalError);

  const bordersError = validarFronteras(data.borders ? data.borders.split(',').map(b => b.trim().toUpperCase()) : []);
  if (bordersError) errores.push(bordersError);

  const areaError = validarArea(Number(data.area));
  if (areaError) errores.push(areaError);

  const populationError = validarPoblacion(parseInt(data.population, 10));
  if (populationError) errores.push(populationError);

  const idiomasError = validarIdiomas(data.languages ? data.languages.split(',').map(idioma => idioma.trim().toUpperCase()) : []);
  if (idiomasError) errores.push(idiomasError);

  return errores; // Devuelve todos los errores encontrados
};