import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import {
  reorder,
  createNewTabWindow,
  createNewSectionWindow,
} from "./utils/dragFunctions";

import "./App.css";
import Window from "./components/window";
import WindowSection from "./components/windowSection";
import { initialWindow } from "./utils/tabData";
import {
  findWindowById,
  findSectionWindowById,
  isWindowSection,
  SectionWindow,
  TabWindow,
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
      let structureClone = { ...structure };
      // get reference to copy of source window
      let window = findWindowById(sourceId, structure.primaryAxis)!;
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
        // parse drop zone
        const tab = window.tabs.splice(result.source.index, 1)!;
        if (!window.tabs.length) {
          /**
           * REMOVE WINDOW FROM PARENT PRIMARY AXIS
           */
        }
        const destinationWindow = findWindowById(
          destinationId,
          structureClone.primaryAxis
        );

        if (destinationWindow) {
          // add to existing window's tabs
          destinationWindow.tabs.push(tab[0]);
          /**
           * TODO PLACE IN CORRECT ORDER
           * RESULT.DESTINATION.INDEX
           * SEE ABOVE
           */
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
            parent.primaryAxis.push(newWindow);
            /**
             * TODO
             * PLACE IN CORRECT INDEX
             */
          } else {
            // TRANSFORM TAB WINDOW TO SECTION WINDOW
            destinationSibling.parentIsVertical = parent.isVertical;
            const newSectionWindow = createNewSectionWindow(
              [destinationSibling, newWindow],
              !parent.isVertical
            );
            const destinationSiblingIndex = parent.primaryAxis.indexOf(
              destinationSibling
            );
            parent.primaryAxis[destinationSiblingIndex] = newSectionWindow;
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

        const newSectionWindow = createNewSectionWindow(
          [window, newTabWindow],
          isVertical
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
