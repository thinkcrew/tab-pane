import "react-reflex/styles.css";
import { SectionWindow } from "../utils/tabWindow";
import { isWindowSection } from "../utils/tabWindow";
import Window from "./window";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import { createReflex } from "../utils/createReflex";

export interface SectionWindowProps {
  window: SectionWindow;
}

const WindowSection: React.FC<SectionWindowProps> = ({ window }) => {
  return (
    <ReflexContainer
      orientation={window.isVertical ? "horizontal" : "vertical"}
    >
      {createReflex(window).map((window: any, index: any) => {
        if (window === "SPLIT")
          return <ReflexSplitter key={index} />;
        if (!isWindowSection(window)) {
          return (
            !!window.tabs.length && (
              <ReflexElement key={window.id}>
                <Window tabWindow={window} index={index} />
              </ReflexElement>
            )
          );
        } else {
          return (
            <ReflexElement key={window.id}>
              <WindowSection window={window} />
            </ReflexElement>
          );
        }
      })}
    </ReflexContainer>
  );
};

export default WindowSection;
