import { isWindowSection, SectionWindow, TabWindow } from "./tabWindow";

export const createReflex = (window: SectionWindow) => {
  if (!isWindowSection(window)) return window;
  const arr: (TabWindow | SectionWindow | String)[] = [];
  if (isWindowSection(window)) {
    window.primaryAxis.forEach((win, idx, _arr) => {
      arr.push(win);
      if (idx !== window.primaryAxis.length - 1) arr.push("SPLIT");
    });
  }
  return arr;
};
