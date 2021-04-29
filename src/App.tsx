import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import {
  reorder,
  createNewTabWindow,
  createNewSectionWindow,
  getColumnOffset,
} from "./utils/dragFunctions";

import "./App.css";
import Window from "./components/window";
import WindowSection from "./components/windowSection";
import { initialWindow } from "./utils/tabData";
import {
  findWindowById,
  findSectionWindowById,
  isWindowSection,
  isTabWindow,
  SectionWindow,
  TabWindow,
  removeRedundantSectionWindows,
  addWindowSectionAtIndex,
} from "./utils/tabWindow";

function App() {
  const [structure, setStructure] = useState<TabWindow | SectionWindow>(
    initialWindow
  );
  console.log(structure);
  function onDragEnd(result: DropResult) {
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
      let window = findWindowById(sourceId, structure.primaryAxis)!;

      if (
        window.tabs.length === 1 &&
        sourceId === destinationId.split("-")[0]
      ) {
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
        // parse drop zone
        const tab = window.tabs.splice(result.source.index, 1)!;
        // find parent
        let parent: SectionWindow | TabWindow =
          window.parentId === structureClone.id
            ? structureClone
            : findSectionWindowById(
                window.parentId as string,
                structureClone.primaryAxis
              )!;

        if (!window.tabs.length) {
          // filter out window with no tabs
          parent.primaryAxis = parent.primaryAxis.filter((window) => {
            if (isTabWindow(window)) {
              return window.tabs.length > 0;
            } else if (isWindowSection(window)) {
              return window.primaryAxis.length > 0;
            }
            return false;
          });
          const grandparent =
            structureClone.id === parent.parentId
              ? structureClone
              : findSectionWindowById(
                  parent.parentId,
                  structureClone.primaryAxis
                );
          const parentIndex = grandparent?.primaryAxis.indexOf(parent);
          if (parent.primaryAxis.length === 0 && grandparent !== undefined) {
            // remove empty section window from grandparent primary axis
            grandparent.primaryAxis = grandparent?.primaryAxis.filter(
              (window) => window.id !== parent.id
            );
          }
          // if only one element, transform to tabwindow
          if (parent.primaryAxis.length === 1) {
            if (grandparent && parentIndex) {
              grandparent.primaryAxis[parentIndex] = parent.primaryAxis[0];
              grandparent.primaryAxis[parentIndex].parentId = grandparent.id;
              grandparent.primaryAxis.forEach((window) => {
                if (isTabWindow(window)) {
                  window.parentIsVertical = grandparent.isVertical;
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

          let parent: SectionWindow | TabWindow =
            destinationWindow.parentId === structureClone.id
              ? structureClone
              : findSectionWindowById(
                  destinationWindow.parentId as string,
                  structure.primaryAxis
                )!;

          // filter out window with no tabs
          parent.primaryAxis = parent.primaryAxis?.filter((window) => {
            if (isTabWindow(window)) {
              return window.tabs.length > 0;
            } else if (isWindowSection(window)) {
              return window.primaryAxis.length > 0;
            }
            return false;
          });
          // if only one element, transform to tabwindow
          if (parent.primaryAxis?.length === 1) {
            const grandparent =
              structureClone.id === parent.parentId
                ? structureClone
                : findSectionWindowById(
                    parent.parentId,
                    structureClone.primaryAxis
                  );
            const parentIndex = grandparent?.primaryAxis.indexOf(parent);
            if (grandparent && parentIndex) {
              grandparent.primaryAxis[parentIndex] = parent.primaryAxis[0];
              grandparent.primaryAxis[parentIndex].parentId = grandparent.id;
            }
          }

          if (
            isWindowSection(structureClone) &&
            structureClone.primaryAxis.length === 1
          ) {
            // reset to default state of single tab window
            structureClone = structureClone.primaryAxis[0];
            structureClone.parentId = null;
          }
          if (isWindowSection(structureClone)) {
            removeRedundantSectionWindows(structureClone);
          }
          setStructure(structureClone);
        } else {
          // create new window
          const destinationWindowIdAsArray = destinationId.split("-");
          // identify id of destination window
          const destinationWindowId = destinationWindowIdAsArray[0];
          const destinationDropZone = destinationWindowIdAsArray[1];
          const destinationSibling = findWindowById(
            destinationWindowId,
            structureClone.primaryAxis
          )!;
          const parent =
            destinationSibling.parentId === structure.id
              ? structure
              : findSectionWindowById(
                  destinationSibling.parentId as string,
                  structure.primaryAxis
                )!;
          const newWindow = createNewTabWindow(
            tab,
            window.parentIsVertical,
            parent?.id || "null"
          );
          // recursively search for window of drop zone
          /**
           * WE NEED TO KNOW DIRECTION OF PARENT
           * TO DETERMINE WHICH LEVEL TO APPEND
           * WINDOW TO -
           * PRIMARY AXIS OF PARENT
           * OR TRANSFORM TO SECTION WINDOW AND ADD AS SIBLING
           */
          if (
            (destinationSibling.parentIsVertical &&
              destinationDropZone === "bottom") ||
            (!destinationSibling.parentIsVertical &&
              destinationDropZone !== "bottom")
          ) {
            // APPEND TO PARENT PRIMARY AXIS
            let siblingIndex = parent.primaryAxis.indexOf(destinationSibling);
            if (destinationSibling.parentIsVertical) {
              addWindowSectionAtIndex(
                newWindow,
                parent.primaryAxis,
                siblingIndex + 1
              );
            } else {
              siblingIndex += getColumnOffset(destinationId);
              addWindowSectionAtIndex(
                newWindow,
                parent.primaryAxis,
                siblingIndex
              );
            }
          } else {
            /**
             * TRANSFORM TAB WINDOW TO SECTION WINDOW
             */
            destinationSibling.parentIsVertical = parent.isVertical;
            let destinationSiblingIndex = parent.primaryAxis.indexOf(
              destinationSibling
            );
            if (
              destinationSibling.parentIsVertical &&
              !getColumnOffset(destinationId)
            ) {
              // determine if on left or right side and construct array accordingly
              const newSectionWindow = createNewSectionWindow(
                [newWindow, destinationSibling],
                !parent.isVertical,
                parent.id
              );
              parent.primaryAxis[destinationSiblingIndex] = newSectionWindow;
            } else {
              // add it to
              const newSectionWindow = createNewSectionWindow(
                [destinationSibling, newWindow],
                !parent.isVertical,
                parent.id
              );
              parent.primaryAxis[destinationSiblingIndex] = newSectionWindow;
            }
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
        const isVertical = destinationZone === "bottom";
        const newTabWindow = createNewTabWindow(tab, !isVertical, structure.id);
        window.parentIsVertical = isVertical;

        let primaryAxis = [];

        if (!isVertical && destinationZone === "left") {
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
  return (
    <main>
      <DragDropContext onDragEnd={onDragEnd}>
        {!isWindowSection(structure) ? (
          <Window tabWindow={structure} index={0} />
        ) : (
          <WindowSection window={structure} />
        )}
      </DragDropContext>
    </main>
  );
}

export default App;
