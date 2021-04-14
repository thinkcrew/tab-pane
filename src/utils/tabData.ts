import { TabWindow } from "./tabWindow";

export interface TabData {
  id: number;
  name: string;
  content: string;
}

export const initialWindow: TabWindow = {
  tabs: [
    {
      id: 1,
      name: "Breakdown",
      content: "Breakdown content",
    },
    {
      id: 2,
      name: "Recycle Bin",
      content: "Recycle Bin content",
    },
    {
      id: 3,
      name: "Stripboard",
      content: "Stripboard content",
    },
    {
      id: 4,
      name: "Script",
      content: "Script content",
    },
    {
      id: 5,
      name: "Elements",
      content: "Elements content",
    },
    {
      id: 6,
      name: "Dood",
      content: "Dood content",
    },
  ],
  selectedTabId: 1,
  id: createUniqueWindowId(),
  parentIsVertical: false,
};

export function createUniqueWindowId(): string {
  return Math.random().toString(16).slice(2);
}
