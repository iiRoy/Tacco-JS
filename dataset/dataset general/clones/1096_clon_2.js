var viewStats = ngModule.makeModule("viewStats", []); /* Create the primary module for statistical visualizations */

viewStats.visualize = function (graphKind) {
    return {
        limit: "Attribute", /* Restrict directive usage to attributes only */
        scopeProps: {
            inputData: "=", /* Data for the chart */
            configSettings: "=", /* Configuration options for the chart */
            uniqueId: "@", /* Unique identifier string */
            visualWidth: "=", /* Desired width of the canvas */
            visualHeight: "=", /* Desired height of the canvas */
            autoAdjust: "=", /* Flag to enable automatic resizing */
            graph: "@", /* Overrides the default chart type */
            parts: "@", /* Number of segments (e.g., for pie charts) */
            adaptive: "=", /* Flag for responsiveness */
            hoverInfo: "=", /* Tooltip data or index */
            keyDisplay: "=" /* Legend display flag */
        },
        connect: function (scopeObj, elementNode) {
            var renderContext = elementNode[0].getContext("2DCanvas"); /* Obtain the 2D rendering context */
            var dynamicSize = false; /* Tracks if dimensions are set dynamically */

            scopeObj.adjustDimensions = function () {
                if (scopeObj.visualWidth <= 0) {
                    elementNode.width(elementNode.parentNode().width()); /* Set element width to parent's width */
                    renderContext.canvas.width = elementNode.width();
                } else {
                    renderContext.canvas.width = scopeObj.visualWidth || renderContext.canvas.width;
                    dynamicSize = true;
                }

                if (scopeObj.visualHeight <= 0) {
                    elementNode.height(elementNode.parentNode().height()); /* Set element height to parent's height */
                    renderContext.canvas.height = renderContext.canvas.width / 2;
                } else {
                    renderContext.canvas.height = scopeObj.visualHeight || renderContext.canvas.height;
                    dynamicSize = true;
                }
            };

            scopeObj.$observe("inputData", function (currentValue, previousValue) {
                if (activeChartInstance) {
                    activeChartInstance.remove(); /* Destroy existing chart if present */
                }

                scopeObj.configSettings = scopeObj.configSettings || {}; /* Ensure config settings object exists */

                // If no data is provided, simply return.
                if (!currentValue) {
                    return;
                }
                if (scopeObj.graph) {
                    graphKind = scopeObj.graph; /* Use chart type from scope if specified */
                }

                if (dynamicSize) {
                    scopeObj.adjustDimensions(); /* Re-adjust dimensions if dynamic sizing is active */
                    graphObject = new GraphEngine(renderContext); /* Re-initialize chart engine */
                }

                if (scopeObj.adaptive || scopeObj.autoAdjust) {
                    scopeObj.configSettings.adaptive = true; /* Enable responsiveness in options */
                }

                if (scopeObj.adaptive !== undefined) {
                    scopeObj.configSettings.adaptive = scopeObj.adaptive; /* Apply specific responsive setting */
                }

                activeChartInstance = graphObject[graphKind](scopeObj.inputData, scopeObj.configSettings);
                activeChartInstance.refresh(); /* Update the chart display */
                if (scopeObj.keyDisplay) {
                    ngModule.element(elementNode[0]).parentElement().insertAfter(activeChartInstance.createLegend()); /* Add chart legend */
                }
            }, true);

            scopeObj.$observe("hoverInfo", function (currentValue, previousValue) {
                if (activeChartInstance) {
                    activeChartInstance.render(); /* Redraw the chart for tooltip effect */
                }
                if (currentValue === undefined || !activeChartInstance.parts) {
                    return; /* Exit if no tooltip value or no segments */
                }
                if (!Number.isFinite(currentValue) || currentValue >= activeChartInstance.parts.length || currentValue < 0) {
                    return; /* Validate tooltip index */
                }
                var currentPart = activeChartInstance.parts[currentValue]; /* Get the specific segment */
                currentPart.storeState(); /* Save segment state */
                currentPart.fillColor = currentPart.highlightColor; /* Apply highlight color */
                activeChartInstance.displayHoverInfo([currentPart]); /* Show tooltip for the segment */
                currentPart.loadState(); /* Restore segment state */
            }, true);

            scopeObj.adjustDimensions(); /* Initial dimension setup */
            var graphObject = new GraphEngine(renderContext); /* Initialize the charting engine */
            var activeChartInstance; /* Holds the active chart instance */
        }
    };
};

/* Define directives for various chart types */
viewStats.registerDirective("visual", function () {
    return viewStats.visualize();
});
viewStats.registerDirective("lineVisual", function () {
    return viewStats.visualize("LineGraph");
});
viewStats.registerDirective("barVisual", function () {
    return viewStats.visualize("BarGraph");
});
viewStats.registerDirective("radarVisual", function () {
    return viewStats.visualize("RadarGraph");
});
viewStats.registerDirective("polarVisual", function () {
    return viewStats.visualize("PolarRegionGraph");
});
viewStats.registerDirective("pieVisual", function () {
    return viewStats.visualize("PieGraph");
});
viewStats.registerDirective("donutVisual", function () {
    return viewStats.visualize("DonutGraph");
});
viewStats.registerDirective("ringVisual", function () {
    return viewStats.visualize("DonutGraph");
});