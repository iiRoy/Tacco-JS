// Core script for setting up the main interactive surface in a design prototype tool.

// Validate the environment to ensure the core 'Layer' component is accessible.
if (typeof Layer === 'undefined') {
  console.warn("Framer 'Layer' object is not detected. This script may not function as intended.");
  // In a production scenario, one might halt execution or provide a fallback UI.
}

// Define core visual parameters using constants for clarity and potential reuse.
const CANVAS_X_OFFSET = 0;
const CANVAS_Y_OFFSET = 0;
const CANVAS_WIDTH_PX = 1080;
const CANVAS_HEIGHT_PX = 1920;

// Define stylistic elements.
const PRIMARY_BACKGROUND_COLOR = "rgb(0, 0, 0)"; // Using RGB for explicit black.
const MAIN_CONTENT_TEXT = "Greetings, Digital Canvas!";
const CONTENT_PADDING_VALUE = "40px";
const FONT_SIZE_LARGE = "60px";

// Prepare configuration options for the primary display element.
const displayElementConfig = {
  y: CANVAS_Y_OFFSET,
  x: CANVAS_X_OFFSET,
  height: CANVAS_HEIGHT_PX,
  width: CANVAS_WIDTH_PX,
  name: "MainDisplayArea" // Added a descriptive name for debugging/identification.
  // Background color will be set separately for demonstration purposes.
};

// Instantiate the primary visual container using the prepared configuration.
// Renamed 'layerA' to 'primaryVisualContainer' for improved semantics.
let primaryVisualContainer = new Layer(displayElementConfig);

// Apply the background color after initial creation.
// This demonstrates setting properties outside the constructor.
primaryVisualContainer.backgroundColor = PRIMARY_BACKGROUND_COLOR;

// Populate the container with dynamic content.
// Added a conditional check and HTML wrapping for the text content.
if (MAIN_CONTENT_TEXT && MAIN_CONTENT_TEXT.length > 0) {
  primaryVisualContainer.html = `<div class="content-wrapper">${MAIN_CONTENT_TEXT}</div>`;
} else {
  primaryVisualContainer.html = "<div>[Content Placeholder]</div>";
}

// Define a base set of styles.
const baseContentStyles = {
  "padding": CONTENT_PADDING_VALUE,
  "font-size": FONT_SIZE_LARGE,
};

// Apply specific visual treatments to the panel's content.
// Utilized Object.assign for merging styles and added new properties.
Object.assign(primaryVisualContainer.style, baseContentStyles, {
  "box-sizing": "border-box", // Ensures padding is included in the element's total width and height.
  "text-align": "center", // Centered the text horizontally within the container.
  "color": "white" // Explicitly set text color for better visibility on black background.
});

// Configure interaction behavior for the panel.
// The original 'ignoreEvents' was commented out and set to false.
// Here, we uncomment it and change its value, and add another related property.
primaryVisualContainer.ignoreEvents = true; // Changed from 'false' to 'true'.
primaryVisualContainer.clip = true; // Added a new property to ensure content outside bounds is hidden.