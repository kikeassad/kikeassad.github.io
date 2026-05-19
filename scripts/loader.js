// Cada entrada mapea el ID del elemento en el DOM con el archivo HTML a cargar.
// Si necesitas añadir una nueva sección (skills, certifications...), solo agregas
// una entrada aquí. No tienes que tocar ninguna otra parte del código.
const fragments = [
  { id: "nav",        file: "nav"        },
  { id: "footer",     file: "footer"     },
  { id: "experience", file: "experience" },
];

// Función que carga UN solo fragmento y lo inserta en su elemento del DOM.
// La separamos para que sea fácil de leer y de testear por separado.
const loadFragment = async ({ id, file }) => {
  // Obtenemos el elemento primero. Si no existe en el DOM, abortamos
  // temprano en lugar de hacer una petición de red innecesaria.
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Elemento con id "${id}" no encontrado en el DOM.`);
    return;
  }

  // Hacemos la petición al archivo HTML del fragmento
  const response = await fetch(`/pages/${file}.html`);

  // Es buena práctica verificar que la respuesta fue exitosa (status 200).
  // Sin esto, un 404 silencioso podría dejarte con contenido vacío sin saber por qué.
  if (!response.ok) {
    console.error(`No se pudo cargar el fragmento "${file}.html": ${response.status}`);
    return;
  }

  element.innerHTML = await response.text();
};

// Función principal que orquesta la carga de todos los fragmentos.
// Promise.all() recibe un array de promesas y las ejecuta en paralelo.
// Solo continúa (el .then o el await) cuando TODAS han terminado.
const loadAllFragments = async () => {
  try {
    await Promise.all(fragments.map(loadFragment));

    // Este es el momento clave: todos los fragmentos ya están en el DOM,
    // así que ahora es seguro aplicar las traducciones. Si lo hicieras antes,
    // los elementos con data-i18n podrían no existir todavía.
    const lang = localStorage.getItem("language") || "en";
    const response = await fetch(`/languages/${lang}.json`);
    const langData = await response.json();
    updateContent(langData);

  } catch (err) {
    // Si cualquiera de las promesas falla, el catch lo captura aquí.
    console.error("Error cargando los fragmentos:", err);
  }
};

loadAllFragments();