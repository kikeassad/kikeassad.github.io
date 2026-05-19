// ─── Persistence layer ───────────────────────────────────────────────────────
// Single responsibility: read/write the user's language preference from localStorage.

export const getStoredLang = () => localStorage.getItem("language") || "en";
export const storeLang = (lang) => localStorage.setItem("language", lang);


// ─── Data layer ──────────────────────────────────────────────────────────────
// Only knows how to fetch data. Completely unaware of the DOM or localStorage.

export const fetchLangData = async (lang) => {
  const response = await fetch(`/languages/${lang}.json`);
  if (!response.ok) throw new Error(`Language file not found: ${lang}.json`);
  return response.json();
};


// ─── Rendering layer ─────────────────────────────────────────────────────────
// Each function below knows how to turn one data shape into HTML.
// Keeping them separate means changing one section never risks breaking another.

// Builds the HTML for a single work experience card.
const renderJob = (job) => {
  const items = job.description.map(item => `<li>${item}</li>`).join("");
  return `
    <div class="job-card">
      <div class="job-header">
        <h3 class="job-company">${job.company}</h3>
        <span class="job-dates">${job.date_start} — ${job.date_end}</span>
      </div>
      <p class="job-position">${job.position}</p>
      <p class="job-location"><i class="fa fa-location-dot"></i> ${job.location}</p>
      <ul class="job-description">${items}</ul>
    </div>
  `;
};

// Iterates work_experience and mounts all job cards.
// Using Object.values() means adding a new job to the JSON is all you ever need to do.
const renderWorkExperience = (langData) => {
  const container = document.getElementById("work-experience-list");
  if (!container || !langData.work_experience) return;
  container.innerHTML = Object.values(langData.work_experience)
    .map(job => renderJob(job))
    .join("");
};


// Builds the HTML for a single education entry.
const renderDegree = (degree) => `
  <div class="edu-card">
    <div class="edu-header">
      <h3 class="edu-institution">${degree.institution}</h3>
      <span class="edu-dates">${degree.date_start} — ${degree.date_end}</span>
    </div>
    <p class="edu-degree">${degree.degree}</p>
    ${degree.department ? `<p class="edu-department">${degree.department}</p>` : ""}
    <p class="edu-gpa">${degree.gpa}</p>
  </div>
`;

const renderEducation = (langData) => {
  const container = document.getElementById("education-list");
  if (!container || !langData.education) return;
  container.innerHTML = Object.values(langData.education)
    .map(degree => renderDegree(degree))
    .join("");
};


// Builds the HTML for a single certification.
const renderCertification = (cert) => {
  // Only render a link if one was provided in the JSON.
  const linkHtml = cert.link
    ? `<a href="${cert.link}" target="_blank" class="cert-link">
         <i class="fa fa-arrow-up-right-from-square"></i> View credential
       </a>`
    : cert.credential
      ? `<span class="cert-credential">ID: ${cert.credential}</span>`
      : "";

  return `
    <div class="cert-card">
      <div class="cert-header">
        <h3 class="cert-name">${cert.name}</h3>
        <span class="cert-date">${cert.date}</span>
      </div>
      <p class="cert-issuer">${cert.issuer}</p>
      ${linkHtml}
    </div>
  `;
};

const renderCertifications = (langData) => {
  const container = document.getElementById("certifications-list");
  if (!container || !langData.certifications_list) return;
  container.innerHTML = Object.values(langData.certifications_list)
    .map(cert => renderCertification(cert))
    .join("");
};


// Builds the HTML for a single project card.
const renderProject = (project) => {
  const tags = project.tags
    .map(tag => `<span class="project-tag">${tag}</span>`)
    .join("");

  return `
    <div class="project-card">
      <h3 class="project-title">${project.title}</h3>
      <p class="project-description">${project.description}</p>
      <div class="project-tags">${tags}</div>
    </div>
  `;
};

const renderProjects = (langData) => {
  const container = document.getElementById("projects-list");
  if (!container || !langData.projects_list) return;
  container.innerHTML = Object.values(langData.projects_list)
    .map(project => renderProject(project))
    .join("");
};


// ─── Main content updater ────────────────────────────────────────────────────
// Receives the full language object and updates the entire DOM in two passes:
// 1) Static elements tagged with data-i18n (section titles, nav labels, etc.)
// 2) Dynamic sections that need HTML generation (jobs, education, etc.)

export const updateContent = (langData) => {
  // Only process keys whose value is a plain string — this prevents
  // an object like work_experience from rendering as "[object Object]".
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = langData[el.getAttribute("data-i18n")];
    if (typeof value === "string") el.textContent = value;
  });

  renderWorkExperience(langData);
  renderEducation(langData);
  renderCertifications(langData);
  renderProjects(langData);

  // Update the active state of the language buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.id === `btn-${getStoredLang()}`);
  });
};


// ─── Language change (called by EN/ES buttons) ────────────────────────────────
export const changeLanguage = async (lang) => {
  storeLang(lang);
  const langData = await fetchLangData(lang);
  updateContent(langData);
};

// Expose to window so onclick attributes in the HTML can reach it.
// This is necessary because ES module functions are not global by default.
window.changeLanguage = changeLanguage;

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// There is no "DOMContentLoaded" listener here — loader.js controls the order.
// It waits for ALL fragments to be in the DOM first, then calls updateContent().
// This file only exports tools; it does not decide when to use them.
