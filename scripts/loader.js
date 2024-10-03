const navElement = document.querySelector("nav");

const fetchNav = async () => {
  try {
    const res = await fetch("../pages/nav.html");
    const template = await res.text();

    navElement.innerHTML = template;
  } catch (err) {
    console.log(err);
  }
};

fetchNav();