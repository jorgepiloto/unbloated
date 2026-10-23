// SPDX-License-Identifier: LGPL-3.0-only
/**
 * Add interaction to the documentation's tab example. The CSS package provides
 * appearance only; this adapter supplies selection, focus, and panel visibility.
 */
for (const tablist of document.querySelectorAll("[data-demo-tabs]")) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute("aria-controls")),
  );
  if (!tabs.length || panels.some((panel) => !panel)) continue;

  /**
   * Select a tab, update its associated panel, and move keyboard focus to it.
   * @param {HTMLButtonElement} selected Tab belonging to this example.
   */
  const select = (selected) => {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute("aria-controls")).hidden =
        !active;
    }
    selected.focus();
  };

  for (const [index, tab] of tabs.entries()) {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const target = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(tabs[target]);
    });
  }
  // Commit panel visibility only after all controls and listeners are ready.
  for (const [index, tab] of tabs.entries()) {
    const active = index === 0;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    panels[index].hidden = !active;
  }
}
