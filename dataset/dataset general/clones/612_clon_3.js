// --- Visualization Configuration and Setup ---

// Define the core dimensions and padding for the charting area.
const chartViewSettings = {
    drawWidth: 400,  // Overall width of the visual element.
    drawHeight: 200, // Overall height of the visual element.
    paddingBottom: 20, // Space reserved at the bottom.
    paddingLeft: 20    // Space reserved on the left side.
    // Note: 'right' and 'top' margins from original code have been removed for Type III deletion.
};

// Accessor functions to extract specific coordinate values from data objects.
const getHorizontalCoordinate = (pointEntry) => pointEntry.x;
const getVerticalCoordinate = (pointEntry) => pointEntry.y;

// Define the domain for the vertical axis.
const verticalDomainMin = 0;
const verticalDomainMax = 4;

// --- Data Validation and Pre-processing ---

// Before proceeding, ensure the input 'data' array is valid and non-empty.
// This is a Type III addition for robustness.
if (!Array.isArray(data) || data.length === 0) {
    console.error("The provided 'data' array is either not an array or is empty. Cannot render chart.");
    // In a real application, you might render an error message or a blank chart.
    // For this clone, we'll stop execution here.
    throw new Error("Invalid or empty data for chart rendering.");
}

// --- Scale Creation ---

// Establish the horizontal mapping scale using extracted x-coordinates.
// The domain is explicitly derived from all data points' horizontal values.
const horizontalAxisScale = protoVis.Scale.linear(
    data.map(getHorizontalCoordinate) // Type III: explicitly map data for domain.
).range(0, chartViewSettings.drawWidth); // Map to the drawing width.

// Establish the vertical mapping scale for the y-axis.
const verticalAxisScale = protoVis.Scale.linear(
    verticalDomainMin,
    verticalDomainMax
).range(0, chartViewSettings.drawHeight); // Map to the drawing height.

// --- Root Panel Initialization ---

// Verify the existence of the target HTML canvas element.
// This is a Type III addition for error handling.
const targetCanvasIdentifier = 'fig';
const canvasElement = document.getElementById(targetCanvasIdentifier);
if (!canvasElement) {
    console.error(`HTML element with ID '${targetCanvasIdentifier}' not found. Chart rendering aborted.`);
    throw new Error("Target canvas element missing.");
}

// Construct the main visualization panel.
const chartMainPanel = new protoVis.Panel()
    .canvas(targetCanvasIdentifier)
    .width(chartViewSettings.drawWidth)
    .height(chartViewSettings.drawHeight)
    .bottom(chartViewSettings.paddingBottom)
    .left(chartViewSettings.paddingLeft)
    ; // Type III: 'right' and 'top' padding statements have been deleted.

// --- Y-Axis and Grid Lines ---

// Define styling for the axis rules.
const mainAxisStroke = "#000000"; // Solid black for the primary axis.
const gridLineStroke = "#EEEEEE"; // Light grey for the minor grid lines.
const desiredVerticalTicks = 5;

// Add vertical rules (grid lines and axis).
chartMainPanel.add(protoVis.Rule)
    .data(verticalAxisScale.ticks(desiredVerticalTicks)) // Generate tick values.
    .bottom(value => verticalAxisScale(value)) // Position rules based on scaled values.
    .strokeStyle(tickVal => tickVal === verticalDomainMin ? mainAxisStroke : gridLineStroke) // Conditional stroke.
    .anchor("left") // Anchor labels to the left of the rules.
    .add(protoVis.Label)
        .text(verticalAxisScale.tickFormat); // Apply default tick formatting.

// --- X-Axis and Tick Marks ---

// Define properties for horizontal tick marks.
const tickMarkHeight = 5; // Length of the tick marks.
const tickMarkVerticalOffset = -5; // Position below the chart bottom.

// Add horizontal rules (tick marks and axis).
chartMainPanel.add(protoVis.Rule)
    .data(horizontalAxisScale.ticks()) // Generate default tick values.
    // Type III: The original 'visible' condition (to hide 0-tick) has been removed.
    .left(value => horizontalAxisScale(value)) // Position rules based on scaled values.
    .bottom(tickMarkVerticalOffset) // Offset for tick marks.
    .height(tickMarkHeight) // Height of the tick marks.
    .anchor("bottom") // Anchor labels below the rules.
    .add(protoVis.Label)
        .text(horizontalAxisScale.tickFormat); // Apply default tick formatting.

// --- Data Area and Outline ---

// Configuration for the filled area.
const areaBaselinePosition = 1; // Pixels from the bottom for the area's base.
const plotAreaFillColor = "rgba(121, 173, 210, 0.6)"; // Type III: Changed to RGBA with transparency.
const plotLineThickness = 3; // Width of the top line.

// Create the filled area element.
// Type III: An intermediate variable 'dataPlotArea' is introduced.
const dataPlotArea = chartMainPanel.add(protoVis.Area)
    .data(data) // Bind the raw data.
    .bottom(areaBaselinePosition) // Set the area's base.
    .left(item => horizontalAxisScale(getHorizontalCoordinate(item))) // Calculate x-position for each data point.
    .height(item => verticalAxisScale(getVerticalCoordinate(item))) // Calculate height for each data point.
    .fillStyle(plotAreaFillColor); // Apply the fill color.

// Add the defining line on top of the filled area.
dataPlotArea.anchor("top").add(protoVis.Line)
    .lineWidth(plotLineThickness); // Set the line's thickness.

// --- Final Render ---

// Initiate the drawing process for the entire visualization.
chartMainPanel.root.render();