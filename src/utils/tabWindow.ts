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

export function removeRedundantSectionWindows(structure: SectionWindow): void {
  const { primaryAxis } = structure;
  for (let i = 0; i < primaryAxis.length; i++) {
    let current = primaryAxis[i];
    if (
      isWindowSection(current) &&
      current.isVertical === structure.isVertical
    ) {
      let curLength = current.primaryAxis.length;
      current.primaryAxis.forEach((window) => (window.parentId = structure.id));
      primaryAxis.splice(i, 1, ...current.primaryAxis);
      i += curLength;
    }
  }
  if (
    primaryAxis.length === 1 &&
    isWindowSection(primaryAxis[0]) &&
    primaryAxis[0].primaryAxis.length === 1
  ) {
    structure.primaryAxis = primaryAxis[0].primaryAxis;
  }
}

export const alignWindowDirections = (sectionWindow: SectionWindow) => {
  sectionWindow.primaryAxis.forEach((window) => {
    if (isTabWindow(window)) {
      window.parentIsVertical = sectionWindow.isVertical;
    } else if (isWindowSection(window)) {
      window.isVertical = !sectionWindow.isVertical;
      alignWindowDirections(window);
    }
  });
};
