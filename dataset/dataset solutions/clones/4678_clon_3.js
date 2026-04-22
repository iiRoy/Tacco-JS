/**
 * A robust utility to convert a string into an integer.
 * It includes basic error handling for non-numeric inputs.
 *
 * @param {string} textualRepresentation - The string value intended to be a number.
 * @param {number} fallbackValue - A default numeric value to use if parsing fails.
 * @returns {number} The successfully parsed integer or the provided fallback value.
 */
function safelyParseInteger(textualRepresentation, fallbackValue = 0) {
  const numericResult = parseInt(textualRepresentation, 10);
  if (isNaN(numericResult)) {
    console.error(`Problematic input detected: "${textualRepresentation}" could not be converted to a number. Defaulting to ${fallbackValue}.`);
    return fallbackValue;
  }
  return numericResult;
}

/**
 * Computes the non-overlapping distance between a linear segment and a single point.
 * The segment is defined by a starting coordinate and a length,
 * and the point is an independent coordinate. The function
 * standardizes the order of the two input coordinates before calculation.
 *
 * @param {string} rawInputSeries - A string containing three space-separated numeric values:
 *                                  the segment length, the first coordinate, and the second coordinate.
 * @returns {number | undefined} The calculated gap distance, or undefined if input is invalid.
 */
const calculateCoordinateSeparation = (rawInputSeries) => {
  // Normalize and split the incoming string into its constituent parts.
  const inputComponents = rawInputSeries.trim().split(/\s+/);

  // Implement a guard clause for insufficient input.
  if (inputComponents.length < 3) {
    console.error("Input format error: Expected three numeric components (length, coord1, coord2). Received fewer.");
    return undefined; // Indicate failure due to invalid input
  }

  // Parse all numeric components using the robust helper function.
  const segmentSpan = safelyParseInteger(inputComponents[0]);
  const initialPointA = safelyParseInteger(inputComponents[1]);
  const initialPointB = safelyParseInteger(inputComponents[2]);

  // Introduce an explicit check for the segment span. While the original code
  // implicitly handles negative 'w' by producing a potentially smaller segment,
  // in many geometric contexts, span should be non-negative. This adds an intermediate check.
  const effectiveSegmentLength = Math.max(0, segmentSpan);
  if (segmentSpan < 0) {
    console.warn(`Note: Input segment length was negative (${segmentSpan}). Using a non-negative effective length of ${effectiveSegmentLength}.`);
  }

  // Determine the consistently ordered left and right boundaries from the two input points.
  // This replaces the explicit 'if (a > b) { swap; }' logic with a more functional approach.
  const standardizedLeftCoordinate = Math.min(initialPointA, initialPointB);
  const standardizedRightCoordinate = Math.max(initialPointA, initialPointB);

  // Calculate the right-most extent of the first segment after standardization.
  const segmentEndPosition = standardizedLeftCoordinate + effectiveSegmentLength;

  let computedDistanceMetric; // Declare the result variable.

  // Evaluate the relative positions to determine the gap.
  // If the segment's end position extends to or past the second standardized coordinate,
  // they are overlapping or adjacent, meaning no separation gap exists.
  const isSegmentOverlappingOrTouchingPoint = (segmentEndPosition >= standardizedRightCoordinate);

  if (isSegmentOverlappingOrTouchingPoint) {
    computedDistanceMetric = 0; // The segment covers or touches the point.
  } else {
    // The segment ends strictly before the second standardized coordinate.
    // The gap is the difference between the point and the segment's end.
    computedDistanceMetric = standardizedRightCoordinate - segmentEndPosition;
  }

  // Log the final computed value to the console using a more descriptive message.
  console.log(`Calculated separation: ${computedDistanceMetric}`);
  return computedDistanceMetric; // Return value for potential further processing or testing.
};

// --- Execution Environment Management ---

/**
 * Handles execution when the script is run in a Node.js environment,
 * typically for command-line execution or competitive programming platforms.
 * It reads input from a specified file path.
 *
 * @param {string} sourcePath - The file path from which to read input data.
 */
const executeNodeScript = (sourcePath) => {
  try {
    // Dynamically require 'fs' module, common in Node.js.
    const fileContentBuffer = require("fs").readFileSync(sourcePath, "utf8");
    calculateCoordinateSeparation(fileContentBuffer);
  } catch (operationError) {
    console.error(`Execution failure in Node.js environment for path "${sourcePath}": ${operationError.message}`);
  }
};

/**
 * Simulates an interactive execution within a web browser context.
 * This function would typically be bound to a UI event, such as a button click.
 */
const triggerBrowserCalculation = () => {
  // Use a more modern and flexible selector for the input element.
  const browserInputField = document.querySelector("input#inputDataField");
  if (browserInputField && browserInputField.value) {
    console.log("Initiating calculation based on browser input...");
    calculateCoordinateSeparation(browserInputField.value);
  } else {
    console.warn("No input element found or no value provided for browser-based calculation.");
  }
};

// Determine the current execution context (Node.js vs. Browser)
// and invoke the appropriate setup/execution logic.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  // This block runs if the script is executed directly via Node.js CLI.
  // The traditional input path for competitive programming on Linux systems.
  executeNodeScript("/dev/stdin");
} else if (typeof document !== 'undefined') {
  // This block runs if the script is loaded in a web browser.
  // It sets up an event listener for a hypothetical UI button to trigger the calculation.
  document.addEventListener('DOMContentLoaded', () => {
    const calculateButton = document.querySelector("button#runCalcButton");
    if (calculateButton) {
      calculateButton.addEventListener('click', triggerBrowserCalculation);
      console.log("Browser environment setup complete: Event listener attached to #runCalcButton.");
    } else {
      console.warn("Browser setup warning: Calculation button (#runCalcButton) not found.");
    }
  });
} else {
  // Fallback for any other unrecognized JavaScript environment.
  console.info("Script is running in an unknown JavaScript environment. Automatic execution not triggered.");
}