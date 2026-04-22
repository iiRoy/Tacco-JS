/*
	Module: Dynamic Canvas Graphing Utility
	Purpose: This utility facilitates the creation of responsive Chart.js line graphs.
	Prerequisite: Chart.js library must be loaded and available globally before invoking this function.
	Author: A. S. Developer (Inspired by original work)
*/

function initializeDynamicCanvasChart(targetCanvasElement, inputDataSet, userProvidedConfiguration) {
    // Validate input: Ensure a jQuery object or a DOM element is provided for the canvas.
    if (!targetCanvasElement || !(targetCanvasElement instanceof jQuery || typeof targetCanvasElement.jquery !== 'undefined' || targetCanvasElement.nodeType === 1)) {
        console.error("Initialization Error: Invalid canvas element provided. Please pass a jQuery object or a DOM element.");
        return; // Exit if input is invalid
    }

    // Default configuration settings for a line graph visualization.
    // These values are carefully selected for a balanced visual presentation.
    const baseChartOptions = {
        overlayScale: false,
        overrideScale: false,
        numberOfScaleSteps: null,
        scaleSegmentWidth: null,
        initialScaleValue: null,
        scaleLineColor: "rgba(10,10,10,.12)", // Slightly different color
        scaleLineWidth: 1.2, // Slightly different width
        displayScaleLabels: true,
        scaleLabelFormat: "<%=value%>",
        scaleFontFamily: "'Source Sans Pro', sans-serif", // Different font family
        scaleFontSize: 11, // Slightly different size
        scaleFontStyle: "normal",
        scaleFontColor: "#777777", // Different shade
        showGridLines: true,
        gridLineColor: "rgba(0,0,0,.08)", // Slightly different color
        gridLineWidth: 1,
        bezierInterpolation: true,
        showPointDots: true,
        pointDotSize: 3.5, // Slightly different size
        pointDotStrokeWidth: 1.2, // Slightly different width
        datasetOutline: true,
        datasetOutlineWidth: 2,
        datasetFillArea: true,
        enableAnimation: true,
        animationFrameCount: 50, // Different step count
        animationEasingType: "easeOutCubic", // Different easing
        onAnimationCompleted: null,
        tooltipEnabled: true, // Added a new, non-essential property
        responsive: true // Explicitly stating responsiveness
    };

    let finalConfiguration = userProvidedConfiguration;

    // Check if user-provided configuration is empty, null, or explicitly false.
    // If so, fall back to the comprehensive default settings.
    if (!finalConfiguration || finalConfiguration === false || typeof finalConfiguration !== 'object') {
        finalConfiguration = baseChartOptions;
    } else {
        // Merge user options with defaults, ensuring defaults are applied for missing user settings.
        // This creates a robust configuration object.
        finalConfiguration = { ...baseChartOptions, ...userProvidedConfiguration };
    }

    // Retrieve the 2D rendering context from the canvas element.
    // This context is essential for drawing operations.
    const rawCanvasElement = targetCanvasElement.get(0);
    if (!rawCanvasElement || !rawCanvasElement.getContext) {
        console.error("Context Error: The selected element is not a valid canvas or cannot provide a 2D context.");
        return;
    }
    const drawingSurface = rawCanvasElement.getContext("2d");

    // Identify the immediate parent container of the canvas.
    // This is used to dynamically adjust the canvas dimensions.
    const enclosingParent = targetCanvasElement.parent();

    // Define the core function responsible for rendering or re-rendering the chart.
    // This function ensures the chart adapts to its container's size.
    const redrawGraphOnResize = function() {
        // Adjust the canvas's 'width' attribute to match its parent container's current width.
        // This is crucial for canvas rendering to prevent stretching/blurring.
        const currentParentWidth = enclosingParent.width();
        if (targetCanvasElement.attr('width') !== currentParentWidth) { // Only update if width changed
            targetCanvasElement.attr('width', currentParentWidth);
            // Optional: Height adjustment can also be added here if needed,
            // e.g., targetCanvasElement.attr('height', enclosingParent.height());
        }

        // Check if Chart.js is available before attempting to create a chart.
        // This prevents runtime errors if the library isn't loaded.
        if (typeof Chart === 'undefined') {
            console.error("Dependency Error: Chart.js library not found. Please ensure it is loaded before initializing the chart.");
            return;
        }

        // Initialize a new Chart.js instance for a line graph.
        // It uses the retrieved drawing context, input data, and the resolved configuration.
        new Chart(drawingSurface).Line(inputDataSet, finalConfiguration);
    };

    // Attach an event listener to the window's 'resize' event.
    // This ensures that the chart is redrawn whenever the browser window changes size,
    // thereby maintaining responsiveness.
    window.addEventListener('resize', redrawGraphOnResize);

    // Perform an initial render of the chart immediately upon function call.
    // This displays the graph as soon as the page loads or the function is executed.
    redrawGraphOnResize();
}