import { updateContent, getStoredLang, fetchLangData } from "./langSelector.js";

// Each entry maps a DOM element ID to its corresponding HTML fragment file.
// Adding a new section only requires adding one entry here — nothing else changes.
const fragments = [
  { id: "nav",        file: "nav"        },
  { id: "footer",     file: "footer"     },
  { id: "experience", file: "experience" },
  { id: "studies",    file: "studies"    },
  { id: "projects",   file: "projects"   },
];

// Loads ONE fragment and injects it into its DOM mount point.
// We check for the element first to fail fast — no point making a network
// request if the placeholder doesn't exist in the page.
const loadFragment = async ({ id, file }) => {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found in the DOM.`);
    return;
  }

  const response = await fetch(`pages/${file}.html`);
  if (!response.ok) {
    console.error(`Could not load fragment "${file}.html": ${response.status}`);
    return;
  }

  element.innerHTML = await response.text();
};

// Orchestrates loading all fragments in parallel, then applies translations.
// Promise.all() is key: it guarantees every fragment is in the DOM before
// updateContent() runs, eliminating any race condition between loading and rendering.
const loadAllFragments = async () => {
  try {
    await Promise.all(fragments.map(loadFragment));

    // All fragments are now mounted — safe to apply translations.
    const lang = getStoredLang();
    const langData = await fetchLangData(lang);
    updateContent(langData);

  } catch (err) {
    console.error("Error loading fragments:", err);
  }
};

loadAllFragments();


// ─── Tab switching ────────────────────────────────────────────────────────────
// Each .tab-btn has a data-tab attribute matching the id of its target section.
// Clicking a button removes .tab-active from everything and adds it only to the
// matching section — so all other panels disappear and only the chosen one shows.
// We also toggle .active on the buttons so the CSS can highlight the current tab.
//
// We attach this listener to <nav class="topnav"> rather than individual buttons,
// which is called "event delegation": one listener handles all current and future
// buttons instead of re-binding every time the language changes.
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;

  const targetId = btn.dataset.tab;

  // Deactivate all tabs and panels...
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  document.querySelectorAll(".content-section").forEach(s => s.classList.remove("tab-active"));

  // ...then activate only the selected ones.
  btn.classList.add("active");
  btn.setAttribute("aria-selected", "true");
  document.getElementById(targetId)?.classList.add("tab-active");
});
