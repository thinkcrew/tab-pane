import { TabData } from "./tabData";

export interface TabWindow {
  tabs: TabData[];
  selectedTabId: number;
  parentIsVertical: boolean;
  parentId?: string;
  id: string;
}

export interface SectionWindow {
  id: string;
  parentId: string | null;
  isVertical: boolean;
  primaryAxis: (TabWindow | SectionWindow)[]; // array of windows that stack along the primary axis
}

export function isWindowSection(
  item: TabWindow | SectionWindow
): item is SectionWindow {
  return (item as SectionWindow).primaryAxis !== undefined;
}
export function isTabWindow(
  item: TabWindow | SectionWindow
): item is TabWindow {
  return (item as TabWindow).tabs !== undefined;
}

export function addWindowSectionAtIndex(
  sibling: TabWindow,
  array: (TabWindow | SectionWindow)[],
  index: number
) {
  array.splice(index, 0, sibling);
}

export function findWindowById(
  id: string,
  array: (TabWindow | SectionWindow)[]
): TabWindow | undefined {
  let result;
  for (let window of array) {
    if (!isWindowSection(window) && window.id === id) {
      return window;
    } else if (isWindowSection(window)) {
      result = findWindowById(id, window.primaryAxis);
      if (result !== undefined) return result;
    }
  }
  return result;
}

export function findSectionWindowById(
  id: string | null,
  array: (TabWindow | SectionWindow)[]
): SectionWindow | undefined {
  for (let window of array) {
    if (isWindowSection(window)) {
      if (window.id === id) {
        return window;
      } else {
        const result = findSectionWindowById(id, window.primaryAxis);
        if (result !== undefined) return result;
      }
    }
  }
}
