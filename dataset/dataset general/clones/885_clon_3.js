/*
This module extends the Flot charting library with interactive region selection capabilities.

It introduces several configuration options under `selection` in the main plot options:

  chartOptions.selection: {
    mode: null | "horizontal" | "vertical" | "both", // Defines selection behavior.
    fillColor: string,                               // Color for the selection overlay's fill.
    lineColor: string,                               // Border color for the selection overlay.
    lineWidth: number                                // Border width for the selection overlay.
  }

To activate selection support, set `mode` to "horizontal", "vertical", or "both".
- "horizontal" mode allows selection only along the X-axis, spanning the full Y-height.
- "vertical" mode restricts selection to the Y-axis, spanning the full X-width.
- "both" mode enables rectangular selection across both axes.
The `fillColor`, `lineColor`, and `lineWidth` options control the appearance of the interactive selection rectangle.

Upon user interaction, this plugin dispatches custom events on the chart's DOM element:

- "chartregionselected": Fired when a user successfully completes a selection (mouse up).
  The event handler receives `(event, selectedRanges)`, where `selectedRanges`
  is an object detailing the 'from' and 'to' values for each selected axis (e.g., `selectedRanges.xaxis.from`).

- "chartregionchanging": Continuously fired while the user is actively dragging to make a selection.
  It provides the current `(event, currentRanges)` similar to "chartregionselected", allowing for real-time feedback.
  If the selection is invalid during drag, `currentRanges` will be `null`.

- "chartregioncleared": Emitted when an existing selection is removed (e.g., by clicking outside the selected area
  or making an invalid selection). This event carries no additional arguments.

The plugin also enriches the `chartInstance` object with the following public methods:

- `establishRegion(newRanges, suppressEvent)`:
  Programmatically sets the selection rectangle. `newRanges` should mirror the structure of `selectedRanges`
  received by "chartregionselected". If `suppressEvent` is true, the "chartregionselected" event
  will not be triggered by this method call.

- `resetRegion(suppressEvent)`:
  Removes any active selection. If `suppressEvent` is true, "chartregioncleared" will not be fired.

- `retrieveCurrentRegion()`:
  Returns the currently active selection in the `selectedRanges` format, or `null` if no selection exists.

*/

(function (externalJQuery) {
    // A sensible default for the minimum size a selection must have to be considered "valid".
    const MIN_VALID_REGION_SIZE = 5; // pixels

    /**
     * Entry point for the Flot selection plugin.
     * @param {object} chartInstance The Flot plot object instance.
     */
    function initializeSelectionPlugin(chartInstance) {
        // State management for the current selection process.
        let currentSelectionState = {
                startPoint: { x: -1, y: -1}, // Canvas coordinates of the mouse down event.
                endPoint: { x: -1, y: -1},   // Canvas coordinates of the current mouse position.
                isVisible: false,            // Flag indicating if the selection rectangle should be drawn.
                isActivelyDragging: false    // Flag indicating if a drag operation is currently in progress.
            };
        // Reference to the visual selection element (e.g., Raphael rectangle).
        let selectionVisualElement = null;

        // Cache for original DOM event handlers, used to temporarily disable text selection/dragging.
        const originalEventHandlerCache = {};
        
        // Stores the bound mouseup handler to allow for proper unbinding later.
        let activeMouseReleaseHandler = null;

        /**
         * Helper function to retrieve the plot's current drawing area dimensions.
         * @returns {{width: number, height: number}} An object containing the width and height.
         */
        const getPlotDimensions = () => {
            return {
                width: chartInstance.width(),
                height: chartInstance.height()
            };
        };

        /**
         * Constrains a given value within a specified numerical range [lowerBound, upperBound].
         * @param {number} lowerBound The minimum allowed value.
         * @param {number} currentValue The value to constrain.
         * @param {number} upperBound The maximum allowed value.
         * @returns {number} The constrained value.
         */
        const constrainValueToRange = (lowerBound, currentValue, upperBound) => {
            return Math.max(lowerBound, Math.min(currentValue, upperBound));
        };

        /**
         * Dispatches a custom event on the chart's placeholder DOM element.
         * @param {string} eventName The name of the event to dispatch (e.g., "chartregionselected").
         * @param {Array<any>} eventArgs An array of arguments to pass to the event handler.
         */
        const emitChartEvent = (eventName, eventArgs) => {
            chartInstance.getPlaceholder().trigger(eventName, eventArgs);
        };

        /**
         * Handles pointer (mouse) movement events during an active drag.
         * Updates the selection state and triggers real-time feedback.
         * @param {jQuery.Event} domEvent The jQuery mousemove event object.
         */
        function handlePointerMovement(domEvent) {
            if (currentSelectionState.isActivelyDragging) {
                updateRegionCoordinate(currentSelectionState.endPoint, domEvent);
                const regionIsCurrentlyValid = isRegionValid();
                
                currentSelectionState.isVisible = regionIsCurrentlyValid; // Only show if valid
                chartInstance.triggerRedrawOverlay();
                
                emitChartEvent("chartregionchanging", [ regionIsCurrentlyValid ? retrieveCurrentRegion() : null ]);
            }
        }

        /**
         * Handles pointer (mouse) press events, initiating a new selection.
         * @param {jQuery.Event} domEvent The jQuery mousedown event object.
         */
        function handlePointerPress(domEvent) {
            // Only proceed if the primary mouse button (left-click) is used.
            if (domEvent.which !== 1) {
                return;
            }

            const chartOptions = chartInstance.getOptions();
            // Early exit if selection mode is not configured.
            if (!chartOptions.selection || !chartOptions.selection.mode) {
                return;
            }
            
            // Prevent default browser text selection and drag-and-drop behavior.
            document.body.focus(); // Ensure body has focus to cancel any active text selection.

            // Store original handlers and disable default browser behavior.
            // This ensures consistent behavior across different browser versions.
            if (document.onselectstart !== undefined && originalEventHandlerCache.onselectstart === undefined) {
                originalEventHandlerCache.onselectstart = document.onselectstart;
                document.onselectstart = () => false;
            }
            if (document.ondragstart !== undefined && originalEventHandlerCache.ondragstart === undefined) {
                originalEventHandlerCache.ondragstart = document.ondragstart;
                document.ondragstart = () => false;
            }

            // Set the starting point of the selection.
            updateRegionCoordinate(currentSelectionState.startPoint, domEvent);
            // Initialize the endPoint to the same location, it will be updated on drag.
            currentSelectionState.endPoint.x = currentSelectionState.startPoint.x;
            currentSelectionState.endPoint.y = currentSelectionState.startPoint.y;

            currentSelectionState.isActivelyDragging = true;
            currentSelectionState.isVisible = false; // Selection is initially hidden until a valid drag occurs.
            
            // Bind a one-time mouseup handler to finalize the selection.
            activeMouseReleaseHandler = (releaseEvent) => { handlePointerRelease(releaseEvent); };
            externalJQuery(document).one("mouseup", activeMouseReleaseHandler);
        }

        /**
         * Handles pointer (mouse) release events, finalizing or clearing the selection.
         * @param {jQuery.Event} domEvent The jQuery mouseup event object.
         */
        function handlePointerRelease(domEvent) {
            activeMouseReleaseHandler = null; // Clear the reference to allow garbage collection.
            
            // Restore original browser event handlers.
            if (originalEventHandlerCache.onselectstart !== undefined) {
                document.onselectstart = originalEventHandlerCache.onselectstart;
                delete originalEventHandlerCache.onselectstart;
            }
            if (originalEventHandlerCache.ondragstart !== undefined) {
                document.ondragstart = originalEventHandlerCache.ondragstart;
                delete originalEventHandlerCache.ondragstart;
            }

            currentSelectionState.isActivelyDragging = false;
            // Capture the final mouse position for the selection's end point.
            updateRegionCoordinate(currentSelectionState.endPoint, domEvent);

            if (isRegionValid()) {
                dispatchRegionSelectedNotification();
            } else {
                // If the selection is not valid (e.g., too small), treat it as a clear operation.
                resetRegion(false); // Trigger clear event.
                emitChartEvent("chartregionchanging", [ null ]); // Signal that selection is gone.
            }

            return false; // Prevent default mouseup behavior.
        }

        /**
         * Retrieves the current selection coordinates in data space.
         * @returns {object|null} An object containing 'from' and 'to' values for each axis,
         *                        or null if no valid selection is active.
         */
        function retrieveCurrentRegion() {
            if (!isRegionValid()) {
                return null;
            }

            const selectedCoordinates = {};
            const startCoords = currentSelectionState.startPoint;
            const endCoords = currentSelectionState.endPoint;

            // Iterate over all active axes to convert pixel coordinates to data values.
            Object.values(chartInstance.getAxes()).forEach(plotAxis => {
                if (plotAxis.used) {
                    const val1 = plotAxis.c2p(startCoords[plotAxis.direction]);
                    const val2 = plotAxis.c2p(endCoords[plotAxis.direction]);
                    // Store the range for this axis, ensuring 'from' is always less than 'to'.
                    selectedCoordinates[plotAxis.n + plotAxis.direction + "axis"] = {
                        from: Math.min(val1, val2),
                        to: Math.max(val1, val2)
                    };
                }
            });
            return selectedCoordinates;
        }

        /**
         * Dispatches the "chartregionselected" event with the current selection data.
         */
        function dispatchRegionSelectedNotification() {
            const selectedCoordinates = retrieveCurrentRegion();
            if (selectedCoordinates) { // Only dispatch if a valid selection exists.
                emitChartEvent("chartregionselected", [ selectedCoordinates ]);
            }
        }

        /**
         * Updates the given coordinate point based on the mouse event and plot boundaries.
         * Applies selection mode constraints ("horizontal", "vertical", "both").
         * @param {object} coordinatePoint The point object to update (e.g., currentSelectionState.startPoint).
         * @param {jQuery.Event} domEvent The jQuery mouse event.
         */
        function updateRegionCoordinate(coordinatePoint, domEvent) {
            const chartOptions = chartInstance.getOptions();
            const containerOffset = chartInstance.getPlaceholder().offset();
            const drawingAreaOffset = chartInstance.getPlotOffset();
            const plotDims = getPlotDimensions();

            // Calculate raw pixel coordinates relative to the plot's drawing area.
            let rawX = domEvent.pageX - containerOffset.left - drawingAreaOffset.left;
            let rawY = domEvent.pageY - containerOffset.top - drawingAreaOffset.top;

            // Constrain coordinates within the plot's drawing area to prevent selection outside.
            coordinatePoint.x = constrainValueToRange(0, rawX, plotDims.width);
            coordinatePoint.y = constrainValueToRange(0, rawY, plotDims.height);

            // Apply mode-specific constraints to the coordinates.
            if (chartOptions.selection.mode === "vertical") {
                // For vertical selection, X-coordinates always span the full width.
                coordinatePoint.x = (coordinatePoint === currentSelectionState.startPoint) ? 0 : plotDims.width;
            } else if (chartOptions.selection.mode === "horizontal") {
                // For horizontal selection, Y-coordinates always span the full height.
                coordinatePoint.y = (coordinatePoint === currentSelectionState.startPoint) ? 0 : plotDims.height;
            }
        }

        /**
         * Resets the current selection, making it invisible and optionally triggering an event.
         * @param {boolean} suppressEvent If true, the "chartregioncleared" event will not be fired.
         */
        function resetRegion(suppressEvent) {
            if (currentSelectionState.isVisible) {
                currentSelectionState.isVisible = false;
                chartInstance.triggerRedrawOverlay(); // Request overlay redraw to hide selection.
                if (!suppressEvent) {
                    emitChartEvent("chartregioncleared", [ ]);
                }
            }
            // Also reset selection points to ensure no lingering visual or state.
            currentSelectionState.startPoint = { x: -1, y: -1};
            currentSelectionState.endPoint = { x: -1, y: -1};
            // Remove the Raphael element if it exists to ensure proper cleanup.
            if (selectionVisualElement) {
                selectionVisualElement.remove();
                selectionVisualElement = null;
            }
        }

        /**
         * Extracts the relevant range (from/to) for a given axis direction from a ranges object.
         * Handles multiple axes and ensures 'from' is always less than 'to'.
         * @param {object} inputRanges An object like { xaxis: { from: 0, to: 10 } }.
         * @param {string} axisDirection 'x' or 'y'.
         * @returns {object} An object with { rangeStart, rangeEnd, plotAxis }, or null if not found.
         */
        function deriveAxisRange(inputRanges, axisDirection) {
            let extractedRange = { rangeStart: null, rangeEnd: null, plotAxis: null };
            const allAxes = chartInstance.getAxes();

            // Prioritize finding ranges by specific axis keys (e.g., x2axis, yaxis).
            for (const axisKey in allAxes) {
                const currentAxis = allAxes[axisKey];
                if (currentAxis.direction === axisDirection && currentAxis.used) {
                    const specificAxisKey = axisDirection + currentAxis.n + "axis";
                    const genericAxisKey = axisDirection + "axis";

                    if (inputRanges[specificAxisKey]) {
                        extractedRange.rangeStart = inputRanges[specificAxisKey].from;
                        extractedRange.rangeEnd = inputRanges[specificAxisKey].to;
                        extractedRange.plotAxis = currentAxis;
                        break; // Found the specific axis range, stop searching.
                    } else if (currentAxis.n === 1 && inputRanges[genericAxisKey]) {
                        // Fallback: If it's the primary axis (n=1) and a generic key is used.
                        extractedRange.rangeStart = inputRanges[genericAxisKey].from;
                        extractedRange.rangeEnd = inputRanges[genericAxisKey].to;
                        extractedRange.plotAxis = currentAxis;
                        break; // Found primary axis range, stop searching.
                    }
                }
            }
            
            // If a range was found, ensure rangeStart is always less than or equal to rangeEnd.
            if (extractedRange.rangeStart !== null && extractedRange.rangeEnd !== null && extractedRange.rangeStart > extractedRange.rangeEnd) {
                const tempValue = extractedRange.rangeStart;
                extractedRange.rangeStart = extractedRange.rangeEnd;
                extractedRange.rangeEnd = tempValue;
            }
            
            return extractedRange;
        }
        
        /**
         * Programmatically establishes a selection region based on data value ranges.
         * @param {object} newRanges An object defining the new selection, e.g., `{ xaxis: { from: 0, to: 10 } }`.
         * @param {boolean} suppressEvent If true, "chartregionselected" event will not be triggered.
         */
        function establishRegion(newRanges, suppressEvent) {
            const chartOptions = chartInstance.getOptions();
            const plotDims = getPlotDimensions();

            // Input validation for the ranges object.
            if (!newRanges || typeof newRanges !== 'object' || Object.keys(newRanges).length === 0) {
                console.warn("Invalid or empty ranges provided to establishRegion. Clearing selection.");
                resetRegion(true); // Clear existing selection silently.
                return;
            }

            // Determine X-axis coordinates based on selection mode and provided ranges.
            if (chartOptions.selection.mode === "vertical") {
                currentSelectionState.startPoint.x = 0;
                currentSelectionState.endPoint.x = plotDims.width;
            } else {
                const xRange = deriveAxisRange(newRanges, "x");
                if (!xRange.plotAxis || xRange.rangeStart === null || xRange.rangeEnd === null) {
                    console.warn("X-axis range not found or incomplete for programmatic selection. Clearing selection.");
                    resetRegion(true);
                    return;
                }
                currentSelectionState.startPoint.x = xRange.plotAxis.p2c(xRange.rangeStart);
                currentSelectionState.endPoint.x = xRange.plotAxis.p2c(xRange.rangeEnd);
            }

            // Determine Y-axis coordinates based on selection mode and provided ranges.
            if (chartOptions.selection.mode === "horizontal") {
                currentSelectionState.startPoint.y = 0;
                currentSelectionState.endPoint.y = plotDims.height;
            } else {
                const yRange = deriveAxisRange(newRanges, "y");
                if (!yRange.plotAxis || yRange.rangeStart === null || yRange.rangeEnd === null) {
                    console.warn("Y-axis range not found or incomplete for programmatic selection. Clearing selection.");
                    resetRegion(true);
                    return;
                }
                currentSelectionState.startPoint.y = yRange.plotAxis.p2c(yRange.rangeStart);
                currentSelectionState.endPoint.y = yRange.plotAxis.p2c(yRange.rangeEnd);
            }

            currentSelectionState.isVisible = true;
            chartInstance.triggerRedrawOverlay(); // Request redraw to show the new selection.
            if (!suppressEvent && isRegionValid()) {
                dispatchRegionSelectedNotification();
            }
        }

        /**
         * Checks if the current selection rectangle meets the minimum size requirements.
         * @returns {boolean} True if the selection is large enough to be considered valid, false otherwise.
         */
        function isRegionValid() {
            const absWidth = Math.abs(currentSelectionState.endPoint.x - currentSelectionState.startPoint.x);
            const absHeight = Math.abs(currentSelectionState.endPoint.y - currentSelectionState.startPoint.y);
            return absWidth >= MIN_VALID_REGION_SIZE && absHeight >= MIN_VALID_REGION_SIZE;
        }

        // Expose public methods on the chart instance for external control.
        chartInstance.resetRegion = resetRegion;
        chartInstance.establishRegion = establishRegion;
        chartInstance.retrieveCurrentRegion = retrieveCurrentRegion;

        // --- Flot Hooks Integration ---

        // Hook to bind event handlers when the plot is initialized and ready for interaction.
        chartInstance.hooks.bindEvents.push(function(chartInstance, eventBindingContainer) {
            const chartOptions = chartInstance.getOptions();
            if (chartOptions.selection && chartOptions.selection.mode !== null) {
                eventBindingContainer.mousemove(handlePointerMovement);
                eventBindingContainer.mousedown(handlePointerPress);
            }
        });

        // Hook to draw the selection overlay using the Raphael drawing surface.
        chartInstance.hooks.drawOverlay.push(function (chartInstance, drawingSurface) {
            if (currentSelectionState.isVisible && isRegionValid()) {
                const drawingAreaOffset = chartInstance.getPlotOffset();
                const chartOptions = chartInstance.getOptions();

                // Calculate the rectangle's top-left corner and dimensions.
                const rectX = Math.min(currentSelectionState.startPoint.x, currentSelectionState.endPoint.x);
                const rectY = Math.min(currentSelectionState.startPoint.y, currentSelectionState.endPoint.y);
                const rectWidth = Math.abs(currentSelectionState.endPoint.x - currentSelectionState.startPoint.x);
                const rectHeight = Math.abs(currentSelectionState.endPoint.y - currentSelectionState.startPoint.y);

                // Use the configured colors and line width, falling back to defaults if not explicitly set.
                const selectionLineColor = chartOptions.selection.lineColor || chartOptions.selection.color || "#e8cfac";
                const selectionFillColor = chartOptions.selection.fillColor || chartOptions.selection.color || "#e8cfac";
                const selectionLineWidth = chartOptions.selection.lineWidth || 1;

                if (selectionVisualElement) {
                    // If the Raphael element already exists, update its attributes.
                    selectionVisualElement.attr({
                        "x": rectX + drawingAreaOffset.left,
                        "y": rectY + drawingAreaOffset.top,
                        "width": rectWidth,
                        "height": rectHeight,
                        "stroke": selectionLineColor,
                        "stroke-width": selectionLineWidth,
                        "fill": selectionFillColor,
                        "fill-opacity": 0.2 // Always use some transparency for the fill.
                    });
                } else {
                    // If no Raphael element exists, create a new one.
                    selectionVisualElement = drawingSurface.rect(rectX, rectY, rectWidth, rectHeight).attr({
                        "stroke": selectionLineColor,
                        "stroke-width": selectionLineWidth,
                        "stroke-linejoin": "round",
                        "fill": selectionFillColor,
                        "fill-opacity": 0.2
                    }).translate(drawingAreaOffset.left, drawingAreaOffset.top);
                }
            } else if (selectionVisualElement) {
                // If selection is not visible but the visual element still exists, remove it.
                selectionVisualElement.remove();
                selectionVisualElement = null;
            }
        });
        
        // Hook to clean up event handlers and visual elements when the plot is shut down.
        chartInstance.hooks.shutdown.push(function (chartInstance, eventBindingContainer) {
            // Unbind all event handlers attached to the chart's event container.
            eventBindingContainer.unbind("mousemove", handlePointerMovement);
            eventBindingContainer.unbind("mousedown", handlePointerPress);
            // If a mouseup handler was still active, unbind it from the document.
            if (activeMouseReleaseHandler) {
                externalJQuery(document).unbind("mouseup", activeMouseReleaseHandler);
            }
            // Ensure the visual selection element is removed from the drawing surface.
            if (selectionVisualElement) {
                selectionVisualElement.remove();
                selectionVisualElement = null;
            }
            // Restore any original document handlers that were temporarily changed.
            if (originalEventHandlerCache.onselectstart !== undefined) {
                document.onselectstart = originalEventHandlerCache.onselectstart;
            }
            if (originalEventHandlerCache.ondragstart !== undefined) {
                document.ondragstart = originalEventHandlerCache.ondragstart;
            }
        });
    }

    // Register the plugin with Flot, defining its initialization function, options, name, and version.
    externalJQuery.plot.plugins.push({
        init: initializeSelectionPlugin,
        options: {
            selection: {
                mode: null, // Can be null, "horizontal", "vertical", or "both".
                color: "#e8cfac", // Default combined color for fill and line if not specified separately.
                fillColor: null,  // Override fill color; defaults to 'color' if null.
                lineColor: null,  // Override line color; defaults to 'color' if null.
                lineWidth: 1      // Width of the selection border line.
            }
        },
        name: 'regionSelectionModule', // Renamed plugin identifier.
        version: '2.0'                 // Updated version number.
    });
})(jQuery);