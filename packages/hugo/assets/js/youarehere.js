/** This script is used to highlight the current page in the navigation bar.
 *
 * The current page is determined by the URL path. Then, navigation buttons are
 * checked to see if their text content matches the current page.
 */

/** Return the base path of a page.
*
* This algorithm uses a regular expression that looks for the first '/'
* character in the pathname and extracts all the following characters until the
* very next '/'.
*
* @param  {String} page Pathname representing the page.
* @return {String}      Base directory containing the page. 
*
*/
function getBasePath(page) {
    const regex = /^\/([^\/]+)/
    const match = page.match(regex);
    return match ? match[1] : "";
}

function highlightNavButton() {
    // Page looks like: /about/, /posts/. The home page is just /
    const page = window.location.pathname;

    const navButtons = document.querySelectorAll("nav button");

    // If button text matches page, add active class else remove active class
    navButtons.forEach(button => {

        // Button text content looks like: About, Posts, Home
        const buttonText = button.textContent.toLowerCase();
        const basePath = getBasePath(page).toLowerCase();

        if (basePath === "" && buttonText === "home") {
            button.classList.add("active");
        }
        else if (basePath === buttonText + ".html" || basePath === buttonText) {
            button.classList.add("active");
        }
    });
}

document.addEventListener("DOMContentLoaded", highlightNavButton);
