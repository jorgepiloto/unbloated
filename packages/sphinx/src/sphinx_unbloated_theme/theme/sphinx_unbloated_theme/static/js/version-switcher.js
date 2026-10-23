/** Populate #version-switcher from its JSON feed; reject cross-origin destinations. */
document.addEventListener("DOMContentLoaded", function () {
  const select = document.getElementById("version-switcher");
  if (!select) return;

  function versionURL(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value, document.baseURI);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.origin !== window.location.origin ||
        url.username ||
        url.password
      )
        return null;
      return url.href;
    } catch {
      return null;
    }
  }

  fetch(select.dataset.versionsUrl)
    .then(function (response) {
      if (!response.ok) throw new Error("Cannot load documentation versions");
      return response.json();
    })
    .then(function (versions) {
      if (!Array.isArray(versions)) throw new Error("Invalid version list");
      select.replaceChildren();
      let currentURL = "";
      let currentRootLength = -1;
      versions.forEach(function (version) {
        if (!version || typeof version.name !== "string") return;
        const url = versionURL(version.url);
        if (!url) return;
        const option = document.createElement("option");
        option.value = url;
        option.textContent = version.name;
        select.appendChild(option);
        const path = new URL(url).pathname;
        const root = path.replace(/\/+$/, "");
        const currentPath = window.location.pathname;
        // HTML destinations match one page; other paths identify directory roots.
        const matches = /\.(?:html?|xhtml)$/i.test(path)
          ? currentPath === path
          : currentPath === root || currentPath.startsWith(root + "/");
        if (matches && root.length > currentRootLength) {
          currentURL = url;
          currentRootLength = root.length;
        }
      });
      if (!select.options.length)
        throw new Error("No valid documentation versions");
      if (currentURL) select.value = currentURL;
      else {
        const current = document.createElement("option");
        current.value = "";
        current.textContent = "Current page (unlisted)";
        current.disabled = true;
        select.prepend(current);
        select.value = "";
      }
      select.addEventListener("change", function () {
        const url = versionURL(select.value);
        if (url) window.location.assign(url);
      });
    })
    .catch(function () {
      select.closest(".version-switcher").style.display = "none";
    });
});
