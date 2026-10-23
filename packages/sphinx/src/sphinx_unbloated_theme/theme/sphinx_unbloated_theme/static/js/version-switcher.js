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
      versions.forEach(function (version) {
        if (!version || typeof version.name !== "string") return;
        const url = versionURL(version.url);
        if (!url) return;
        const option = document.createElement("option");
        option.value = url;
        option.textContent = version.name;
        select.appendChild(option);
        if (
          window.location.href.startsWith(url) &&
          url.length > currentURL.length
        )
          currentURL = url;
      });
      if (!select.options.length)
        throw new Error("No valid documentation versions");
      if (currentURL) select.value = currentURL;
      select.addEventListener("change", function () {
        const url = versionURL(select.value);
        if (url) window.location.assign(url);
      });
    })
    .catch(function () {
      select.closest(".version-switcher").style.display = "none";
    });
});
