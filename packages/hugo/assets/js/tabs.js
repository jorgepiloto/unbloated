/** Enhance tabs/tab shortcode groups; sync peers by label and retain script-free panels. */
document.addEventListener("DOMContentLoaded", () => {
  const syncedGroups = new Map();

  document.querySelectorAll(".tabs").forEach((group) => {
    const list = group.querySelector(".tabs-list");
    const tabs = Array.from(list.children);
    const panels = tabs.map((tab) =>
      document.getElementById(tab.getAttribute("aria-controls")),
    );

    const selectTab = (index) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[tabIndex].hidden = !selected;
      });
    };

    const sync = group.dataset.tabSync;
    if (sync) {
      if (!syncedGroups.has(sync)) {
        syncedGroups.set(sync, []);
      }
      syncedGroups.get(sync).push({ tabs, selectTab });
    }

    const selectSyncedTab = (index) => {
      selectTab(index);
      if (sync) {
        const name = tabs[index].textContent.trim();
        syncedGroups.get(sync).forEach((peer) => {
          if (peer.tabs === tabs) return;
          const peerIndex = peer.tabs.findIndex(
            (tab) => tab.textContent.trim() === name,
          );
          if (peerIndex !== -1) peer.selectTab(peerIndex);
        });
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectSyncedTab(index));
      tab.addEventListener("keydown", (event) => {
        let nextIndex;
        switch (event.key) {
          case "ArrowLeft":
            nextIndex = (index - 1 + tabs.length) % tabs.length;
            break;
          case "ArrowRight":
            nextIndex = (index + 1) % tabs.length;
            break;
          case "Home":
            nextIndex = 0;
            break;
          case "End":
            nextIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        event.preventDefault();
        selectSyncedTab(nextIndex);
        tabs[nextIndex].focus();
      });
    });

    selectTab(0);
  });
});
