/** Search the generated same-site index; all index strings remain literal text. */
const container = document.getElementById("search-results");
// URLSearchParams tolerates malformed escapes, decodes plus signs, and uses the
// first s parameter. An empty first parameter prompts for a query.
const searchQuery = new URLSearchParams(location.search).get("s")?.trim() || "";
document.getElementById("search-query").value = searchQuery;

function status(message) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}

async function executeSearch(query) {
  status("Searching…");
  try {
    const indexURL = new URL(container.dataset.indexUrl, location.href);
    if (indexURL.origin !== location.origin)
      throw new Error("Invalid search index URL");
    const response = await fetch(indexURL);
    if (!response.ok) throw new Error("Search index unavailable");
    const data = await response.json();
    const fuse = new Fuse(data, {
      shouldSort: true,
      includeMatches: true,
      threshold: 0.3,
      distance: 100,
      keys: [
        { name: "title", weight: 0.8 },
        { name: "contents", weight: 0.5 },
        { name: "tags", weight: 0.3 },
        { name: "categories", weight: 0.3 },
      ],
    });
    const results = fuse.search(query);
    container.replaceChildren();
    for (const { item, matches = [] } of results) {
      // Index destinations must stay inside this site's deployment path.
      const destination = new URL(item.permalink, indexURL);
      const basePath = indexURL.pathname.replace(/index\.json$/, "");
      if (
        destination.origin !== indexURL.origin ||
        !destination.pathname.startsWith(basePath)
      )
        continue;
      const result = document.createElement("div");
      result.className = "search-result";
      const heading = document.createElement("h3");
      const link = document.createElement("a");
      link.href = destination.href;
      link.textContent = item.title;
      heading.append(link);
      result.append(heading);
      const contents = String(item.contents || "");
      const match = matches.find((match) => match.key === "contents");
      const start = Math.max(0, (match?.indices[0][0] || 0) - 60);
      const snippet = document.createElement("p");
      snippet.className = "search-snippet";
      snippet.textContent = contents.slice(start, start + 120);
      result.append(snippet);
      for (const field of ["categories", "tags"]) {
        if (!item[field]?.length) continue;
        const meta = document.createElement("p");
        meta.className = "search-meta";
        meta.textContent = `${field === "tags" ? "Tags" : "Categories"}: ${[].concat(item[field]).join(", ")}`;
        result.append(meta);
      }
      container.append(result);
      if (typeof Mark !== "undefined") new Mark(result).mark(query);
    }
    if (!container.childElementCount) status("No matches found");
  } catch {
    status("Could not load search index. Please try again later.");
  }
}

if (searchQuery) executeSearch(searchQuery);
else status("Please enter a word or phrase above");
