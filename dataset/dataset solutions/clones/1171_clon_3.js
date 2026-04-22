// This script orchestrates standard input processing to perform a geometric calculation.

// A mutable string buffer to accumulate all incoming data chunks from stdin.
let receivedTextBuffer = '';

// Activate the standard input stream, ensuring it's ready to receive data.
process.stdin.resume();

// Configure the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Register an event handler for 'data' events, which fire when new data is available.
process.stdin.on('data', (incomingDataChunk) => {
  // Append the newly received data chunk to our primary buffer.
  receivedTextBuffer += incomingDataChunk;
});

/**
 * A utility function to compute the square of a given numeric value.
 * This is an equivalent replacement for Math.pow(value, 2).
 * @param {number} val The number to be squared.
 * @returns {number} The square of the input value.
 */
const calculateSquare = (val) => {
  return val * val;
};

/**
 * Safely parses a string into a floating-point number, providing error handling
 * and a default value if parsing fails.
 * @param {string} coordinateString The string representation of a coordinate.
 * @param {number} [defaultValue=0] The value to return if parsing fails.
 * @returns {number} The parsed number or the default value.
 */
const extractNumericCoordinate = (coordinateString, defaultValue = 0) => {
  const parsedValue = parseFloat(coordinateString.trim());
  if (isNaN(parsedValue)) {
    // Log an error for invalid input, but continue processing with a default.
    console.error(`Warning: Could not parse coordinate from '${coordinateString}'. Using default value ${defaultValue}.`);
    return defaultValue;
  }
  return parsedValue;
};

// Register an event handler for the 'end' event, which signals the end of the input stream.
process.stdin.on('end', () => {
  // Prepare the accumulated input by removing leading/trailing whitespace.
  const processedInputLine = receivedTextBuffer.trim();

  // Implement a guard clause: If no meaningful input was provided, report an error and exit.
  if (processedInputLine.length === 0) {
    console.error("Error: No input data was received for processing.");
    // Output a default zero distance to maintain expected output format in error cases.
    console.log("0.000000");
    return;
  }

  // Split the input string into individual components, allowing for multiple spaces as delimiters.
  const inputComponents = processedInputLine.split(/\s+/);

  // Define the expected number of coordinate values.
  const requiredComponentCount = 4;

  // Implement another guard clause: Validate if the correct number of coordinate components were found.
  if (inputComponents.length !== requiredComponentCount) {
    console.error(`Input format error: Expected ${requiredComponentCount} numeric values, but found ${inputComponents.length}.`);
    console.log("0.000000"); // Output default zero distance.
    return;
  }

  // Declare variables to hold the numeric coordinates for two points.
  let p1_x_coord, p1_y_coord;
  let p2_x_coord, p2_y_coord;

  // Parse each component into its respective coordinate variable using the helper function.
  p1_x_coord = extractNumericCoordinate(inputComponents[0]);
  p1_y_coord = extractNumericCoordinate(inputComponents[1]);
  p2_x_coord = extractNumericCoordinate(inputComponents[2]);
  p2_y_coord = extractNumericCoordinate(inputComponents[3]);

  // Calculate the difference along the X-axis.
  const differenceAlongX = p1_x_coord - p2_x_coord;
  // Calculate the difference along the Y-axis.
  const differenceAlongY = p1_y_coord - p2_y_coord;

  // Compute the square of each difference using our custom squaring function.
  const squaredXDifference = calculateSquare(differenceAlongX);
  const squaredYDifference = calculateSquare(differenceAlongY);

  // Sum the squared differences. This is part of the Pythagorean theorem.
  const sumOfSquaredComponents = squaredXDifference + squaredYDifference;

  // Finally, compute the Euclidean distance by taking the square root of the sum.
  const calculatedEuclideanDistance = Math.sqrt(sumOfSquaredComponents);

  // Output the final distance, formatted to precisely six decimal places.
  console.log(calculatedEuclideanDistance.toFixed(6));
});