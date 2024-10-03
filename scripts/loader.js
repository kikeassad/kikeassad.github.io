const navElement = document.querySelector("nav");
const footerElement = document.querySelector("footer");

const fetchNav = async () => {
  try {
    const res = await fetch("../pages/nav.html");
    const template = await res.text();

    navElement.innerHTML = template;
  } catch (err) {
    console.log(err);
  }
};

const fetchFooter = async () => {
  try {
    const res = await fetch("../pages/footer.html");
    const template = await res.text();
    footerElement.innerHTML = template;
  } catch (err) {
    console.log(err);       
  }
};

fetchFooter();
fetchNav();