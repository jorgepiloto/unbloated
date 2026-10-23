/** Legacy nav-button highlighting; current native-link templates do not load this file. */

/**
 * Extract the first nonempty URL path segment, without decoding it.
 * @param {string} page URL pathname, including its leading slash.
 * @returns {string} First segment or an empty string for a root or unmatched path.
 */
function getBasePath(page) {
  const regex = /^\/([^/]+)/;
  const match = page.match(regex);
  return match ? match[1] : "";
}

function highlightNavButton() {
  const page = window.location.pathname;

  const navButtons = document.querySelectorAll("nav button");

  navButtons.forEach((button) => {
    const buttonText = button.textContent.toLowerCase();
    const basePath = getBasePath(page).toLowerCase();

    if (basePath === "" && buttonText === "home") {
      button.classList.add("active");
    } else if (basePath === buttonText + ".html" || basePath === buttonText) {
      button.classList.add("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", highlightNavButton);
