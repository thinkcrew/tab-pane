import React, { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { onDragEnd } from "./utils/dragFunctions";

import "./App.css";
import Window from "./components/window";
import WindowSection from "./components/windowSection";
import { initialWindow } from "./utils/tabData";
import { isWindowSection, SectionWindow, TabWindow } from "./utils/tabWindow";

function App() {
  const [structure, setStructure] = useState<TabWindow | SectionWindow>(
    initialWindow
  );

  return (
    <main>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, structure, setStructure)}
      >
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
