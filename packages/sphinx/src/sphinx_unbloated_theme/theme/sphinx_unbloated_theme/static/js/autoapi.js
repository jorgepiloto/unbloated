document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll(".autoapi-summary")
    .forEach(function (summary, summaryIndex) {
      const panels = Array.from(
        summary.querySelectorAll(":scope > .autoapi-summary-panel"),
      );
      if (panels.length === 0) return;

      const tablist = document.createElement("div");
      tablist.className = "autoapi-tabs";
      tablist.setAttribute("role", "tablist");
      tablist.setAttribute("aria-label", "API summary");

      const tabs = panels.map(function (panel, panelIndex) {
        const title = panel.querySelector(":scope > .rubric");
        const tab = document.createElement("button");
        const prefix = "autoapi-summary-" + summaryIndex + "-" + panelIndex;
        tab.type = "button";
        tab.id = prefix + "-tab";
        tab.textContent = title.textContent;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", prefix + "-panel");
        panel.id = prefix + "-panel";
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.tabIndex = 0;
        title.hidden = true;
        tablist.appendChild(tab);
        return tab;
      });

      function select(index) {
        tabs.forEach(function (tab, tabIndex) {
          const selected = tabIndex === index;
          tab.setAttribute("aria-selected", String(selected));
          tab.tabIndex = selected ? 0 : -1;
          panels[tabIndex].hidden = !selected;
        });
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () {
          select(index);
        });
        tab.addEventListener("keydown", function (event) {
          let next;
          if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
          else if (event.key === "ArrowLeft")
            next = (index + tabs.length - 1) % tabs.length;
          else if (event.key === "Home") next = 0;
          else if (event.key === "End") next = tabs.length - 1;
          else return;
          event.preventDefault();
          select(next);
          tabs[next].focus();
        });
      });

      summary.prepend(tablist);
      select(0);
    });
});
