import React from "react";
import { DropResult } from "react-beautiful-dnd";

import { createUniqueWindowId, TabData } from "./tabData";
import {
  TabWindow,
  SectionWindow,
  isWindowSection,
  isTabWindow,
  findSectionWindowById,
  findWindowById,
  removeRedundantSectionWindows,
  alignWindowDirections,
  addTabWindowAtIndex,
} from "./tabWindow";

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
  return parsedId[1] === "right" ? 1 : 0;
};
export const getRowOffset = (dropZoneId: string): number => {
  const parsedId = dropZoneId.split("-");
  return parsedId[1] === "bottom" ? 1 : 0;
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
    parentIsVertical: parentIsVertical,
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

export const filterOutEmptyWindows = (
  array: (TabWindow | SectionWindow)[]
): (TabWindow | SectionWindow)[] => {
  array = array.filter((window) => {
    if (isTabWindow(window)) {
      return window.tabs.length > 0;
    } else if (isWindowSection(window)) {
      return window.primaryAxis.length > 0;
    }
    return false;
  });

  return array;
};

const filterAllEmptyWindows = (sectionWindow: SectionWindow): void => {
  sectionWindow.primaryAxis = filterOutEmptyWindows(sectionWindow.primaryAxis);
  sectionWindow.primaryAxis.forEach((window) => {
    if (isWindowSection(window)) {
      filterAllEmptyWindows(window);
    }
  });
};

export function onDragEnd(
  result: DropResult,
  structure: TabWindow | SectionWindow,
  setStructure: React.Dispatch<React.SetStateAction<TabWindow | SectionWindow>>
) {
  // dropped outside the list
  if (!result.destination) {
    return;
  }
  const { source, destination } = result;
  const sourceId = source.droppableId;
  const destinationId = destination.droppableId;

  // WILL EVALUATE FALSE IF IN INTITIAL STATE WITH ONE WINDOW
  if (isWindowSection(structure)) {
    // copy data structure to avoid directly mutating state
    let structureClone: SectionWindow | TabWindow = { ...structure };
    // get reference to copy of source window
    let window = findWindowById(sourceId, structureClone.primaryAxis)!;

    if (window.tabs.length === 1 && sourceId === destinationId.split("-")[0]) {
      // PREVENT CRASH WHEN DRAGGING SINGLE TAB INTO ITS OWN DROP ZONES
      return;
    }

    if (sourceId === destinationId) {
      // IS IN SAME WINDOW, REORDER TABS
      // show content of dragged tab
      window.selectedTabId = window.tabs[result.source.index].id;
      // reorder tabs in same window
      const items = reorder(
        window.tabs,
        result.source.index,
        result.destination.index
      );
      window.tabs = items;
      setStructure(structureClone);
    } else {
      // DROPPING IN DIFFERENT WINDOW
      // remove tab from window tabs array
      const tab = window.tabs.splice(result.source.index, 1)!;
      // find parent
      const parent: SectionWindow | TabWindow =
        window.parentId === structureClone.id
          ? structureClone
          : findSectionWindowById(
              window.parentId as string,
              structureClone.primaryAxis
            )!;

      const grandparent =
        structureClone.id === parent?.parentId
          ? structureClone
          : findSectionWindowById(parent.parentId, structureClone.primaryAxis);

      if (!window.tabs.length) {
        parent.primaryAxis = filterOutEmptyWindows(parent.primaryAxis);

        const parentIndex = grandparent?.primaryAxis.indexOf(parent);

        if (parent.primaryAxis.length === 0 && grandparent !== undefined) {
          // remove empty section window from grandparent primary axis
          grandparent.primaryAxis = grandparent?.primaryAxis.filter(
            (window) => window.id !== parent.id
          );
        }
        // if only one element, transform to tabwindow
        if (parent.primaryAxis.length === 1) {
          if (grandparent && parentIndex && parentIndex > -1) {
            grandparent.primaryAxis[parentIndex] = parent.primaryAxis[0];
            grandparent.primaryAxis[parentIndex].parentId = grandparent.id;
            grandparent.primaryAxis.forEach((window) => {
              if (isTabWindow(window)) {
                window.parentIsVertical = grandparent.isVertical;
                window.parentId = grandparent.id;
              }
            });
          }
        }
      }

      const destinationWindow = findWindowById(
        destinationId,
        structureClone.primaryAxis
      );

      if (destinationWindow) {
        // add to existing window's tabs in correct order
        destinationWindow.tabs.splice(result.destination.index, 0, tab[0]);
        destinationWindow.selectedTabId = tab[0].id;

        parent.primaryAxis = filterOutEmptyWindows(parent.primaryAxis);

        // if only one element, transform to tabwindow
        if (parent.primaryAxis?.length === 1) {
          const parentIndex = grandparent?.primaryAxis.indexOf(parent);
          if (grandparent && parentIndex && parentIndex > -1) {
            grandparent.primaryAxis[parentIndex] = parent.primaryAxis[0];
            grandparent.primaryAxis[parentIndex].parentId = grandparent.id;
          }
        }

        if (
          isWindowSection(structureClone) &&
          structureClone.primaryAxis.length === 1
        ) {
          // reset to default state of single tab window
          while (
            isWindowSection(structureClone.primaryAxis[0]) &&
            structureClone.primaryAxis[0].primaryAxis.length === 1
          ) {
            removeRedundantSectionWindows(structureClone);
          }
          structureClone = structureClone.primaryAxis[0];
          if (isWindowSection(structureClone)) structureClone.parentId = null;
          else if (isTabWindow(structureClone))
            structureClone.parentId = "null";
        }
        if (isWindowSection(structureClone)) {
          filterAllEmptyWindows(structureClone);
          removeRedundantSectionWindows(structureClone);
          alignWindowDirections(structureClone);
        }
        setStructure(structureClone);
      } else {
        // CREATE A NEW WINDOW AND PLACE IN THE CORRECT LOCATION
        // parse drop zone
        const destinationWindowIdAsArray = destinationId.split("-");
        // identify id of destination window
        const destinationWindowId = destinationWindowIdAsArray[0];
        const destinationDropZone = destinationWindowIdAsArray[1];
        const destinationSibling = findWindowById(
          destinationWindowId,
          structureClone.primaryAxis
        )!;
        const destinationSectionWindow =
          destinationSibling.parentId === structureClone.id
            ? structureClone
            : findSectionWindowById(
                destinationSibling.parentId as string,
                structure.primaryAxis
              )!;
        const newWindow = createNewTabWindow(
          tab,
          window.parentIsVertical,
          destinationSectionWindow?.id || "null"
        );
        /**
         * WE NEED TO KNOW DIRECTION OF PARENT
         * TO DETERMINE WHICH LEVEL TO APPEND
         * WINDOW TO -
         * PRIMARY AXIS OF PARENT
         * OR TRANSFORM TO SECTION WINDOW AND ADD AS SIBLING
         */
        if (
          (destinationSibling.parentIsVertical &&
            (destinationDropZone === "bottom" ||
              destinationDropZone === "top")) ||
          (!destinationSibling.parentIsVertical &&
            (destinationDropZone === "left" || destinationDropZone === "right"))
        ) {
          /**
           * APPEND TO PARENT PRIMARY AXIS AT CORRECT INDEX
           */
          let siblingIndex = destinationSectionWindow?.primaryAxis.indexOf(
            destinationSibling
          );
          if (destinationSibling.parentIsVertical) {
            siblingIndex += getRowOffset(destinationId);
            addTabWindowAtIndex(
              newWindow,
              destinationSectionWindow.primaryAxis,
              siblingIndex
            );
          } else {
            siblingIndex += getColumnOffset(destinationId);
            addTabWindowAtIndex(
              newWindow,
              destinationSectionWindow.primaryAxis,
              siblingIndex
            );
          }
        } else {
          /**
           * TRANSFORM TAB WINDOW TO SECTION WINDOW
           */
          destinationSibling.parentIsVertical =
            destinationSectionWindow.isVertical;
          newWindow.parentIsVertical = destinationSectionWindow.isVertical;
          let destinationSiblingIndex = destinationSectionWindow.primaryAxis.indexOf(
            destinationSibling
          );
          let primaryAxis = [];
          if (
            (destinationSibling.parentIsVertical &&
              !getColumnOffset(destinationId)) ||
            (!destinationSibling.parentIsVertical &&
              !getRowOffset(destinationId))
          ) {
            // determine location and construct array accordingly
            primaryAxis = [newWindow, destinationSibling];
          } else {
            primaryAxis = [destinationSibling, newWindow];
          }
          const newSectionWindow = createNewSectionWindow(
            primaryAxis,
            !destinationSectionWindow.isVertical,
            destinationSectionWindow.id
          );
          destinationSectionWindow.primaryAxis[
            destinationSiblingIndex
          ] = newSectionWindow;
        }

        // EDGE CASE
        if (
          grandparent &&
          destinationSectionWindow.primaryAxis.length === 1 &&
          isWindowSection(destinationSectionWindow.primaryAxis[0]) &&
          destinationSectionWindow.isVertical !== grandparent.isVertical
        ) {
          let parentIndex = grandparent.primaryAxis.indexOf(
            destinationSectionWindow
          );
          grandparent.primaryAxis.splice(
            parentIndex,
            1,
            ...destinationSectionWindow.primaryAxis[0].primaryAxis
          );
        }
        if (isWindowSection(structureClone)) {
          filterAllEmptyWindows(structureClone);
          removeRedundantSectionWindows(structureClone);
          alignWindowDirections(structureClone);
        }
        setStructure(structureClone);
      }
    }
  } else {
    /**
     * THIS IS THE INITIAL WINDOW
     */
    const window = { ...structure };
    if (sourceId === destinationId) {
      // REORDER TABS OF INITIAL WINDOW
      // show content of dragged tab
      window.selectedTabId = window.tabs[result.source.index].id;
      // reorder tabs in same window
      const items = reorder(
        window.tabs,
        result.source.index,
        result.destination.index
      );
      window.tabs = items;
      setStructure(window);
    } else {
      // TRANSFORM TAB WINDOW INTO SECTION WINDOW
      const tab = window.tabs.splice(result.source.index, 1)!;
      const destinationZone = destinationId.split("-")[1];
      const isVertical =
        destinationZone === "bottom" || destinationZone === "top";
      const newTabWindow = createNewTabWindow(tab, !isVertical, structure.id);
      window.parentIsVertical = isVertical;

      let primaryAxis = [];

      if (
        (!isVertical && destinationZone === "left") ||
        (isVertical && destinationZone === "top")
      ) {
        primaryAxis = [newTabWindow, window];
      } else {
        primaryAxis = [window, newTabWindow];
      }

      const newSectionWindow = createNewSectionWindow(
        primaryAxis,
        isVertical,
        null
      );
      setStructure(newSectionWindow);
    }
  }
}
