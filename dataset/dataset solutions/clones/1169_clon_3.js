const lineReaderInterface = require('readline').createInterface({
  input: process.stdin, // Standard input stream for receiving data
  output: process.stdout // Standard output stream for displaying results
});

/**
 * Calculates the Euclidean distance between two points in a 2D plane.
 * @param {number} x1 - X-coordinate of the first point.
 * @param {number} y1 - Y-coordinate of the first point.
 * @param {number} x2 - X-coordinate of the second point.
 * @param {number} y2 - Y-coordinate of the second point.
 * @returns {number} The Euclidean distance.
 */
function computeGeometricDistance(x1, y1, x2, y2) {
    // Determine the difference in X-coordinates
    const deltaXValue = x1 - x2;
    // Determine the difference in Y-coordinates
    const deltaYValue = y1 - y2;

    // Calculate the square of the X-difference
    const xDifferenceSquared = deltaXValue * deltaXValue;
    // Calculate the square of the Y-difference
    const yDifferenceSquared = deltaYValue * deltaYValue;

    // Sum the squared differences
    const sumOfSquaredDifferences = xDifferenceSquared + yDifferenceSquared;

    // The final distance is the square root of the sum
    return Math.sqrt(sumOfSquaredDifferences);
}

// Attach an event listener to handle incoming lines of text
lineReaderInterface.on('line', (inputString) => {
  // Trim whitespace and split the input string by spaces to get coordinate components
  const numericStrings = inputString.trim().split(' ');

  // --- Type III Addition: Input Validation ---
  // Ensure that exactly four numeric components are provided
  if (numericStrings.length !== 4) {
    console.error("Input Error: Expected four numeric coordinates (x1 y1 x2 y2). Received " + numericStrings.length + " components.");
    process.exit(1); // Exit with an error code
  }

  // Parse each string component into an integer using base 10
  const coord1X = parseInt(numericStrings[0], 10);
  const coord1Y = parseInt(numericStrings[1], 10);
  const coord2X = parseInt(numericStrings[2], 10);
  const coord2Y = parseInt(numericStrings[3], 10);

  // --- Type III Addition: Numeric Validation ---
  // Verify that all parsed values are indeed valid numbers
  if (isNaN(coord1X) || isNaN(coord1Y) || isNaN(coord2X) || isNaN(coord2Y)) {
      console.error("Input Error: One or more provided coordinates are not valid numbers.");
      process.exit(1); // Exit with an error code
  }

  // Utilize the helper function to calculate the distance between the two points
  const distanceCalculated = computeGeometricDistance(coord1X, coord1Y, coord2X, coord2Y);

  // Format the calculated distance to exactly 8 decimal places
  const formattedOutputValue = distanceCalculated.toFixed(8);

  // Output the result to the console
  console.log(formattedOutputValue);

  // Terminate the process immediately after successful calculation and output.
  // This ensures only the first line of input is processed.
  process.exit(0); // Exit successfully
});

// --- Type III Deletion: Removed the 'end' event listener ---
// The original 'end' event listener was non-functional because process.exit()
// is called on the first 'line' event, preventing the 'end' event from ever firing.
// Its removal simplifies the code without changing functionality.