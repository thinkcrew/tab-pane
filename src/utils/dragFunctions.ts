import { createUniqueWindowId, TabData } from "./tabData";
import { TabWindow, SectionWindow } from "./tabWindow";

const grid = 4;

export const reorder = (
  list: TabData[],
  startIndex: number,
  endIndex: number
) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? "#555" : "#333",

  // styles we need to apply on draggables
  ...draggableStyle,
});

export const getListStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "rgba(255,255,255,0.1)" : "#111",
});

export const getTabBarStyle = (isDraggingOver: boolean) => ({
  background: isDraggingOver ? "rgba(255,255,255,0.1)" : "#222",
  display: "flex",
  width: "100%",
  padding: "0.25rem",
});

export const isSameColumn = (dropZoneId: string): boolean => {
  const parsedId = dropZoneId.split("-");
  if (parsedId.length === 2) {
    return parsedId[1] === "bottom";
  }
  return false;
};

export const getColumnOffset = (dropZoneId: string): number => {
  const parsedId = dropZoneId.split("-");
  return parsedId[1] === "right" ? 1 : -1;
};

export const createNewTabWindow = (
  tab: TabData[],
  parentIsVertical: boolean,
  parentId: string
): TabWindow => {
  return {
    tabs: tab,
    id: createUniqueWindowId(),
    selectedTabId: tab[0].id,
    parentIsVertical: !parentIsVertical,
    parentId,
  };
};

export const createNewSectionWindow = (
  tabWindows: TabWindow[],
  isVertical: boolean,
  parentId: string | null
): SectionWindow => {
  const id = createUniqueWindowId();
  tabWindows.forEach((window) => {
    window.parentId = id;
    window.parentIsVertical = isVertical;
  });
  return {
    isVertical: isVertical,
    primaryAxis: tabWindows,
    id,
    parentId,
  };
};
