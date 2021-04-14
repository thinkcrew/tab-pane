import { SectionWindow } from "../utils/tabWindow";
import { isWindowSection } from "../utils/tabWindow";
import Window from "./window";

export interface SectionWindowProps {
  window: SectionWindow;
}

const WindowSection: React.FC<SectionWindowProps> = ({ window }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: window.isVertical ? "column" : "row",
        height: "100%",
        width: "100%",
      }}
    >
      {window.primaryAxis?.map((window, index) => {
        if (!isWindowSection(window)) {
          return (
            !!window.tabs.length && (
              <Window tabWindow={window} index={index} key={window.id} />
            )
          );
        } else {
          return <WindowSection window={window} key={window.id} />;
        }
      })}
    </div>
  );
};

export default WindowSection;
