const REQUIRED_DIMENSION_COUNT = 3;

/**
 * Provides a structured way to output the final computed result.
 * This helper function enhances the clarity of the program's output.
 * @param {number} finalCalculation - The numerical result to be displayed.
 */
function emitResult(finalCalculation) {
  // Using a template literal for output, differing from the original's C-style format specifier.
  console.log(`Total possible arrangements: ${finalCalculation}`);
}

/**
 * Orchestrates the processing of raw textual input to determine grid object placements.
 * This function parses input, validates dimensions, and performs the core calculation.
 * @param {string} rawDataString - The unprocessed string input, expected to contain grid and object dimensions.
 */
function calculateGridPlacements(rawDataString) {
  // Pre-check: Ensure the input string is not empty or composed solely of whitespace.
  if (!rawDataString || rawDataString.trim().length === 0) {
    console.error("Input data is missing or empty. Cannot proceed with calculations.");
    return; // Terminate execution gracefully.
  }

  // Divide the complete input string into an array of individual lines.
  const dataLines = rawDataString.split('\n');

  // Validate the number of input lines against the expected dimension count.
  if (dataLines.length < REQUIRED_DIMENSION_COUNT) {
    console.error(`Insufficient input lines. Expected at least ${REQUIRED_DIMENSION_COUNT}, but received ${dataLines.length}.`);
    return;
  }

  // Extract and convert the first three lines into numerical dimensions.
  // Trimming whitespace from each line ensures robust parsing.
  const [
    overallGridSize,    // Corresponds to 'N' in the original code.
    componentHeight,    // Corresponds to 'H' in the original code.
    componentWidth      // Corresponds to 'W' in the original code.
  ] = dataLines
    .slice(0, REQUIRED_DIMENSION_COUNT) // Focus only on the essential lines.
    .map(line => Number(line.trim())); // Convert each line to a number.

  // Post-parsing validation: Check if any conversion resulted in NaN (Not-a-Number).
  if (isNaN(overallGridSize) || isNaN(componentHeight) || isNaN(componentWidth)) {
    console.error("Failed to parse one or more dimension values into valid numbers. Please check input format.");
    return;
  }

  // Determine the number of valid positions along the horizontal axis.
  // If the component is wider than the grid, this value would be negative,
  // so Math.max(0, ...) ensures we don't end up with negative counts.
  const horizontalPositionsAvailable = Math.max(0, overallGridSize - componentWidth + 1);

  // Determine the number of valid positions along the vertical axis.
  const verticalPositionsAvailable = Math.max(0, overallGridSize - componentHeight + 1);

  // The total number of unique placement configurations is the product of
  // available horizontal and vertical positions.
  const totalValidConfigurations = horizontalPositionsAvailable * verticalPositionsAvailable;

  // Present the final calculated value using the dedicated output function.
  emitResult(totalValidConfigurations);
}

// Main execution block for Node.js environment.
// Reads data from the standard input stream ('/dev/stdin') and processes it.
// 'utf8' encoding ensures the input is correctly interpreted as text.
calculateGridPlacements(require("fs").readFileSync("/dev/stdin", "utf8"));