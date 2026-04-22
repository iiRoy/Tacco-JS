const visualizationModule = angular.module("chartingVisualizations", []);

visualizationModule.createChartComponent = function (chartDesignation) {
    return {
        restrict: "A", // Attribute directive
        scope: {
            chartData: "=",          // Bidirectional binding for chart data
            chartOptions: "=",       // Bidirectional binding for Chart.js options
            elementId: "@",          // One-way string binding for element ID (unused in logic, but present)
            canvasWidth: "=",        // Bidirectional binding for canvas width
            canvasHeight: "=",       // Bidirectional binding for canvas height
            enableResize: "=",       // Bidirectional binding to enable responsive resizing
            chartTypeOverride: "@",  // One-way string binding to override default chart type
            responsiveLayout: "=",   // Bidirectional binding for explicit responsive setting
            activeTooltipIndex: "=", // Bidirectional binding for showing a specific tooltip
            showLegend: "="          // Bidirectional binding to enable legend generation
        },
        link: function (directiveScope, hostElement) {
            let renderContext = null;
            // Attempt to get the 2D rendering context from the canvas element
            if (hostElement && hostElement[0] instanceof HTMLCanvasElement && typeof hostElement[0].getContext === 'function') {
                renderContext = hostElement[0].getContext("2d");
            } else {
                // If canvas context is unavailable, log an error and exit gracefully
                // For a production system, more robust error handling might be needed.
                console.warn("Chart directive: Canvas element or 2D context not found for hostElement:", hostElement);
                return;
            }

            let explicitDimensionsProvided = false; // Flag to indicate if canvas dimensions are set by scope properties
            let activeChartVisualization = null;    // Reference to the active Chart.js instance

            // Helper function to adjust canvas dimensions based on scope properties or parent size
            directiveScope.updateCanvasSizing = function () {
                const parentContainer = hostElement.parent();
                const parentAvailableWidth = parentContainer.width();
                const parentAvailableHeight = parentContainer.height();

                // Determine and set canvas width
                if (!directiveScope.canvasWidth || directiveScope.canvasWidth <= 0) {
                    hostElement.width(parentAvailableWidth);
                    renderContext.canvas.width = hostElement.width();
                    explicitDimensionsProvided = false; // Width is dynamically set from parent
                } else {
                    renderContext.canvas.width = directiveScope.canvasWidth;
                    explicitDimensionsProvided = true; // Width is explicitly provided
                }

                // Determine and set canvas height
                if (!directiveScope.canvasHeight || directiveScope.canvasHeight <= 0) {
                    hostElement.height(parentAvailableHeight);
                    // Default aspect ratio if height is not provided or invalid
                    renderContext.canvas.height = renderContext.canvas.width / 2;
                    explicitDimensionsProvided = false; // Height is dynamically set or defaulted
                } else {
                    renderContext.canvas.height = directiveScope.canvasHeight;
                    explicitDimensionsProvided = true; // Height is explicitly provided
                }
            };

            // Initial setup: Adjust canvas size once and create the initial Chart.js factory instance
            directiveScope.updateCanvasSizing();
            let chartInstanceFactory = new Chart(renderContext);

            // Watch for changes in the 'chartData' scope property
            directiveScope.$watch("chartData", function (newChartDataValue, oldChartDataValue) {
                // Destroy any existing chart instance to prevent memory leaks and ensure fresh rendering
                if (activeChartVisualization) {
                    activeChartVisualization.destroy();
                    activeChartVisualization = null;
                }

                // Ensure chart options object is initialized
                if (!directiveScope.chartOptions) {
                    directiveScope.chartOptions = {};
                }

                // Guard clause: If no valid data is provided, prevent chart creation
                if (!newChartDataValue ||
                    (Array.isArray(newChartDataValue) && newChartDataValue.length === 0) ||
                    (typeof newChartDataValue === 'object' && Object.keys(newChartDataValue).length === 0)) {
                    // No data to render, simply return
                    return;
                }

                // Determine the chart type; scope override takes precedence over the directive's default
                let currentChartType = chartDesignation;
                if (directiveScope.chartTypeOverride) {
                    currentChartType = directiveScope.chartTypeOverride;
                }

                // Re-adjust canvas dimensions. If explicit dimensions were provided, the Chart.js factory
                // instance needs to be re-created as well (Chart.js v1.x behavior).
                if (explicitDimensionsProvided) {
                    directiveScope.updateCanvasSizing(); // Re-apply explicit dimensions
                    chartInstanceFactory = new Chart(renderContext); // Re-create the factory instance
                } else {
                    directiveScope.updateCanvasSizing(); // Update dynamic dimensions in case parent size changed
                }

                // Configure responsiveness within Chart.js options
                if (directiveScope.responsiveLayout !== undefined) {
                    directiveScope.chartOptions.responsive = directiveScope.responsiveLayout;
                } else if (directiveScope.enableResize) {
                    directiveScope.chartOptions.responsive = true;
                } else {
                    directiveScope.chartOptions.responsive = false; // Explicitly disable if not specified
                }

                // Validate the global Chart.js object and the requested chart type method
                if (typeof Chart === 'undefined' || typeof chartInstanceFactory[currentChartType] !== 'function') {
                    console.error(`Chart directive: Chart.js library not loaded or invalid chart type '${currentChartType}'.`);
                    return;
                }

                // Create the new chart instance using the factory method
                activeChartVisualization = chartInstanceFactory[currentChartType](newChartDataValue, directiveScope.chartOptions);

                // Force an update to ensure the chart renders correctly
                activeChartVisualization.update();

                // If legend generation is enabled and available, append it to the parent element
                if (directiveScope.showLegend && activeChartVisualization.generateLegend) {
                    angular.element(hostElement[0]).parent().after(activeChartVisualization.generateLegend());
                }
            }, true); // Deep watch for changes in 'chartData'

            // Watch for changes in the 'activeTooltipIndex' scope property
            directiveScope.$watch("activeTooltipIndex", function (newActiveIndex, oldActiveIndex) {
                // Redraw the chart to clear any previously highlighted tooltip states
                if (activeChartVisualization) {
                    activeChartVisualization.draw();
                }

                // Guard clauses for invalid or undefined tooltip index
                if (newActiveIndex === undefined ||
                    !activeChartVisualization ||
                    !activeChartVisualization.segments ||
                    !Array.isArray(activeChartVisualization.segments)) {
                    return;
                }
                if (!Number.isFinite(newActiveIndex) || newActiveIndex < 0 || newActiveIndex >= activeChartVisualization.segments.length) {
                    // Index is out of bounds or not a valid number
                    return;
                }

                const segmentToHighlight = activeChartVisualization.segments[newActiveIndex];

                // Apply highlight and display the tooltip for the target segment
                if (segmentToHighlight) {
                    segmentToHighlight.save(); // Save the segment's current rendering state
                    segmentToHighlight.fillColor = segmentToHighlight.highlightColor; // Change fill color for highlight
                    activeChartVisualization.showTooltip([segmentToHighlight]); // Display the tooltip
                    segmentToHighlight.restore(); // Restore the segment's original rendering state
                }
            }, true); // Deep watch for changes in 'activeTooltipIndex'
        }
    };
};


// Directive aliases for various Chart.js chart types
visualizationModule.directive("baseChart", function () {
    return visualizationModule.createChartComponent(); // Default chart type, often requires 'chartTypeOverride'
});

visualizationModule.directive("lineGraph", function () {
    return visualizationModule.createChartComponent("Line");
});

visualizationModule.directive("barGraph", function () {
    return visualizationModule.createChartComponent("Bar");
});

visualizationModule.directive("radarPlot", function () {
    return visualizationModule.createChartComponent("Radar");
});

visualizationModule.directive("polarAreaChart", function () {
    return visualizationModule.createChartComponent("PolarArea");
});

visualizationModule.directive("pieChart", function () {
    return visualizationModule.createChartComponent("Pie");
});

visualizationModule.directive("doughnutChart", function () {
    return visualizationModule.createChartComponent("Doughnut");
});

visualizationModule.directive("donutChart", function () { // An alias for Doughnut chart
    return visualizationModule.createChartComponent("Doughnut");
});