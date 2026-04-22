'use strict'; // Enforce strict mode for cleaner code practices

/**
 * Processes raw input string to extract dimensions and coordinates,
 * then performs specific geometric calculations.
 *
 * @param {string} rawInputData - The complete raw input string, typically from stdin.
 */
const processGeometricData = (rawInputData) => {
  // --- Input Validation and Pre-processing ---
  // Ensure the input is a valid non-empty string before proceeding.
  if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
    console.error("Error: Received invalid or empty input data string.");
    // In a real application, one might throw an error or return a default state.
    // For this clone, we'll proceed cautiously, which might lead to NaN if input is truly bad.
    // This is an added robustness feature compared to the original code.
  }

  // Trim leading/trailing whitespace from the entire input and split into individual lines.
  const processedLines = rawInputData.trim().split('\n');

  // We expect at least one line of data for parsing.
  if (processedLines.length === 0) {
    console.error("Error: No data lines found after splitting the input.");
    return; // Exit if no data lines are available.
  }

  // --- Data Extraction and Parsing ---
  // The first line is expected to contain all necessary numerical parameters.
  const primaryDataLine = processedLines[0];

  // A more robust way to parse numerical components from a space-separated string.
  // This helper ensures that only valid numbers are extracted and handles potential non-numeric parts.
  const extractNumericComponents = (lineContent) => {
    // Split the line by spaces, map each part to a Number, and filter out any resulting NaN values.
    return lineContent.split(' ').map(val => Number(val.trim())).filter(val => !isNaN(val));
  };

  const parsedNumericalValues = extractNumericComponents(primaryDataLine);

  // Verify that we have enough numerical parameters as expected (4 in this case).
  // The original code would implicitly handle fewer values by producing `NaN`, we add an explicit check.
  if (parsedNumericalValues.length < 4) {
    console.warn("Warning: Insufficient numerical parameters found. Expected 4, got " + parsedNumericalValues.length + ".");
    // Destructuring with defaults below will mitigate this for core logic.
  }

  // Destructure the parsed values into clearly named variables.
  // Using default values (0) ensures that even with malformed input, calculations don't entirely crash
  // but might produce expected NaN or 0 results, similar to original's implicit NaN handling.
  const [
    boundingWidth = 0,      // Corresponds to 'W' in the original.
    boundingHeight = 0,     // Corresponds to 'H' in the original.
    inputCoordX = 0,        // Corresponds to 'x' in the original.
    inputCoordY = 0         // Corresponds to 'y' in the original.
  ] = parsedNumericalValues;

  // --- Core Calculation Logic ---

  // Calculate half of the total area of the bounding box.
  // The original problem implies this specific calculation.
  const computedAreaSegment = (boundingWidth * boundingHeight) / 2.0; // Explicit float division

  // Determine the exact midpoint coordinates of the bounding box.
  const midpointX = boundingWidth / 2.0;
  const midpointY = boundingHeight / 2.0;

  // --- Conditional Evaluation ---

  // A boolean flag to indicate whether the input coordinates perfectly align with the midpoint.
  let isPointPreciselyCentered = false;

  // Check for exact equality of the input point with the calculated midpoint.
  // This uses a direct boolean assignment for clarity, which then gets converted to an integer flag.
  if (inputCoordX === midpointX && inputCoordY === midpointY) {
    isPointPreciselyCentered = true;
  }

  // Convert the boolean flag to an integer (0 or 1) as required by the original output format.
  const centerMatchIndicator = isPointPreciselyCentered ? 1 : 0;

  // --- Output Results ---

  // Print the calculated area segment and the center match indicator, separated by a space.
  // This adheres to the original output format.
  console.log(computedAreaSegment, centerMatchIndicator);
};

// --- Program Entry Point ---
// This standard boilerplate reads the entire content of /dev/stdin for competitive programming environments
// and passes it to our main processing function.
processGeometricData(require("fs").readFileSync("/dev/stdin", "utf8"));