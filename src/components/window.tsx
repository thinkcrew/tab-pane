import React, { useState, useEffect } from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";

import {
  getItemStyle,
  getListStyle,
  getTabBarStyle,
} from "../utils/dragFunctions";
import "./window.css";
import { TabWindow } from "../utils/tabWindow";

export interface WindowProps {
  tabWindow: TabWindow;
  index: number;
}

const Window: React.FC<WindowProps> = ({ tabWindow, index }) => {
  const [selected, setSelected] = useState(tabWindow.selectedTabId);

  useEffect(() => {
    // this enables both drag and drop and clicking on a tab
    // to set what content is visible below
    if (tabWindow.selectedTabId !== selected)
      setSelected(tabWindow.selectedTabId);
  }, [setSelected, tabWindow.selectedTabId, selected]);

  return (
    <section className="window">
      <div className="tabs-bar">
        <Droppable droppableId={tabWindow.id} direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getTabBarStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {tabWindow.tabs.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                      className="tab"
                      onClick={() => {
                        tabWindow.selectedTabId = item.id;
                        setSelected(item.id);
                      }}
                    >
                      {item.name}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <div className="content-area">
        <Droppable droppableId={`${tabWindow.id}-bottom`}>
          {(provided, snapshot) => (
            <div
              className="body-drop-bottom"
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId={`${tabWindow.id}-left`}>
          {(provided, snapshot) => (
            <div
              className="body-drop-left"
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId={`${tabWindow.id}-right`}>
          {(provided, snapshot) => (
            <div
              className="body-drop-right"
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <p className="tab-content">
          {tabWindow.tabs.find((tab) => tab.id === selected)?.content}
        </p>
      </div>
    </section>
  );
};

export default Window;
