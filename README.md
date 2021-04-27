A Tab has an ID, Name, and Content.

A Tab Window has an array of Tabs, a selected tab, and some data about its parent.

A Section Window has a "primary axis" of either Tab Windows or other nested Section Windows. The primary axis direction (represented by the "isVertical: boolean" property) of each nested level of Section Windows is perpendicular to its parent.

The default state is a single Tab Window with all of the tabs.

As soon as you drag a tab to a drop zone, the state:

- transforms to a top-level Section Window with two Tab Windows
- the primary axis direction is set via the "isVertical" property

On subsequent drag and drops, depending on the drop zone location and primary axis of the parent, the function will either:

- create a new Tab Window from the Tab and add to the primary axis of the parent
- or -
- transform the destination Tab Window to a Section Window with a primary axis perpendicular to that of its parent

Thus, the entire structure is recursive. Section Windows nested within Section Windows, with alternating primary axis directions. Care must be taken to keep the parentId and parentIsVertical properties updated when nesting.
