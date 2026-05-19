// ─── Capa de persistencia ────────────────────────────────────────────────────
// Estas dos funciones tienen una sola responsabilidad: leer y escribir
// el idioma preferido del usuario en localStorage. Nada más.

export const getStoredLang = () => localStorage.getItem("language") || "en";

export const storeLang = (lang) => localStorage.setItem("language", lang);


// ─── Capa de datos ───────────────────────────────────────────────────────────
// Esta función solo sabe cómo ir a buscar los datos. No sabe nada del DOM
// ni de localStorage. Esa separación es el principio de Single Responsibility.

export const fetchLangData = async (lang) => {
  const response = await fetch(`/languages/${lang}.json`);
  if (!response.ok) throw new Error(`No se encontró el archivo de idioma: ${lang}.json`);
  return response.json();
};


// ─── Capa de renderizado ─────────────────────────────────────────────────────
// Estas funciones solo saben cómo transformar datos en HTML y meterlos al DOM.

// Construye el HTML de un trabajo individual a partir de su objeto de datos.
// Separarlo en su propia función nos permite reutilizarlo o modificarlo
// sin tocar la lógica de iteración.
const renderJob = (job) => {
  const descriptionItems = job.description
    .map(item => `<li>${item}</li>`)
    .join("");

  return `
    <div class="job-card">
      <h3 class="job-company">${job.company}</h3>
      <p class="job-position">${job.position}</p>
      <p class="job-dates">${job.date_start} — ${job.date_end}</p>
      <p class="job-location">${job.location}</p>
      <ul class="job-description">${descriptionItems}</ul>
    </div>
  `;
};

// Itera sobre todos los trabajos del JSON y los monta en el contenedor.
// Object.values() nos desacopla de los nombres de llave (TCS, etc.),
// así que añadir un trabajo nuevo al JSON es suficiente — no hay que
// tocar ningún HTML ni JS.
const renderWorkExperience = (langData) => {
  const container = document.getElementById("work-experience-list");
  if (!container || !langData.work_experience) return;

  container.innerHTML = Object.values(langData.work_experience)
    .map(job => renderJob(job))
    .join("");
};

// Función principal de renderizado. Recibe el objeto de idioma completo
// y actualiza todo el contenido del DOM en dos pasos:
// 1) Los elementos estáticos con data-i18n (títulos de sección, nav, etc.)
// 2) Las secciones dinámicas que requieren generar HTML (experiencia laboral)
export const updateContent = (langData) => {
  // Solo procesamos llaves cuyo valor es string para evitar que un objeto
  // como work_experience aparezca como "[object Object]" en pantalla.
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = langData[el.getAttribute("data-i18n")];
    if (typeof value === "string") el.innerHTML = value;
  });

  renderWorkExperience(langData);
};


// ─── Cambio de idioma interactivo ────────────────────────────────────────────
// Esta es la función que llaman los botones EN / ES en el HTML.
// Ya no hace location.reload() — simplemente actualiza el estado y
// vuelve a pintar el contenido, que es todo lo que necesitábamos.
export const changeLanguage = async (lang) => {
  storeLang(lang);
  const langData = await fetchLangData(lang);
  updateContent(langData);
};

// Exponemos changeLanguage en window para que los onclick del HTML
// puedan encontrarla. Esto es necesario cuando usamos módulos ES6,
// porque las funciones de un módulo no son globales por defecto.
window.changeLanguage = changeLanguage;

// ─── NOTA IMPORTANTE ─────────────────────────────────────────────────────────
// Ya no hay un event listener "DOMContentLoaded" aquí.
// Antes este archivo se auto-ejecutaba al cargar la página, pero eso
// causaba una condición de carrera: langSelector corría antes de que
// loader.js terminara de insertar los fragmentos en el DOM.
//
// Ahora loader.js es quien controla el orden. Él espera a que todos los
// fragmentos estén listos y luego llama a updateContent() directamente.
// Este archivo solo exporta herramientas; no decide cuándo usarlas.