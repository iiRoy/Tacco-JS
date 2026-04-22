/**
 * Generates a complex navigational path string based on two numerical inputs.
 * The path involves movements in four cardinal directions (U, R, D, L)
 * with varying segment lengths and offsets, forming a specific pattern.
 *
 * This function specifically reads the third and fourth numbers from the
 * first line of the input string as its primary dimensions.
 *
 * @param {string} rawInputPayload The raw string input, typically from stdin.
 */
function generateNavigationalPath(rawInputPayload) {
  const DEFAULT_DIMENSION_VALUE = 0;

  /**
   * Helper function to robustly parse a string value into a non-negative integer.
   * @param {string} value The string to parse.
   * @param {number} fallback The value to return if parsing fails or number is negative.
   * @returns {number} The parsed and validated dimension value.
   */
  const parseDimension = (value, fallback = DEFAULT_DIMENSION_VALUE) => {
    const num = parseInt(value, 10);
    return (isNaN(num) || num < 0) ? fallback : num;
  };

  let primaryInputLine = "";
  const trimmedPayload = rawInputPayload.trim();

  if (trimmedPayload.length === 0) {
    console.warn("Received empty input payload. Proceeding with default dimensions.");
    primaryInputLine = "";
  } else {
    primaryInputLine = trimmedPayload.split('\n')[0];
  }

  const stringComponentList = primaryInputLine.split(' ');

  // The original code used input[2] and input[3] for x and y.
  // We adhere to this specific (and potentially unusual) indexing.
  const pathConfig = {
    hVal: parseDimension(stringComponentList[2]), // Horizontal extent
    vVal: parseDimension(stringComponentList[3])  // Vertical extent
  };

  const pathSegments = []; // Renamed 'ans' for clarity in string building.

  // Introduce constants for current dimensions for readability.
  const currentHorizontalExtent = pathConfig.hVal;
  const currentVerticalExtent = pathConfig.vVal;

  // First main movement block: Up and Right
  pathSegments.push("U".repeat(currentVerticalExtent));
  pathSegments.push("R".repeat(currentHorizontalExtent));

  // Second main movement block: Down and Left
  pathSegments.push("D".repeat(currentVerticalExtent));
  pathSegments.push("L".repeat(currentHorizontalExtent));

  // Add a distinct single character segment.
  pathSegments.push("L");

  // Introduce intermediate variables for incremented dimensions.
  const extendedVerticalExtent = currentVerticalExtent + 1;
  const extendedHorizontalExtent = currentHorizontalExtent + 1;

  // Third main movement block (with extended dimensions): Up and Right
  pathSegments.push("U".repeat(extendedVerticalExtent));
  pathSegments.push("R".repeat(extendedHorizontalExtent));

  // Combined fixed additions into a single push operation.
  pathSegments.push("DR");

  // Fourth main movement block (with extended dimensions): Down and Left
  pathSegments.push("D".repeat(extendedVerticalExtent));
  pathSegments.push("L".repeat(extendedHorizontalExtent));

  // Add a final distinct single character segment.
  pathSegments.push("U");

  // Join the array of segments into the final path string.
  const finalGeneratedPath = pathSegments.join('');
  console.log(finalGeneratedPath);
}

/**
 * Initiates the path generation process by reading input from stdin.
 */
const initiatePathGeneration = () => {
  let stdinContent = "";
  try {
    // Attempt to read input from the standard input stream.
    stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");
  } catch (error) {
    // Log an error if reading fails and provide a graceful fallback.
    console.error(`Error reading from stdin: ${error.message}. Proceeding with empty input.`);
    stdinContent = ""; // Ensure an empty string for the main function to handle.
  }
  generateNavigationalPath(stdinContent);
};

// Execute the initiation function to start the program.
initiatePathGeneration();