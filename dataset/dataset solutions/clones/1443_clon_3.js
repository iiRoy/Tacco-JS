// A utility function to ensure consistent formatting for numeric output.
const formatToSixDecimalPlaces = (value) => {
  // Guard against non-numeric or invalid input values.
  if (typeof value !== 'number' || isNaN(value)) {
    // Return a default formatted string for invalid numbers.
    return "0.000000";
  }
  // Format the number to exactly six decimal places.
  return value.toFixed(6);
};

/**
 * Calculates various properties of a triangle given two sides and the included angle.
 * This function handles input parsing, validation, and core geometric calculations.
 *
 * @param {string[]} inputDataLines - An array of strings, where the first string
 *                                    contains space-separated numeric values for
 *                                    side A, side B, and the included angle in degrees.
 * @returns {Object|null} An object containing calculated area, perimeter, and height,
 *                          or null if any input validation fails.
 */
function processTriangleMeasurements(inputDataLines) {
  // Initial check for the presence of input data.
  if (!inputDataLines || inputDataLines.length === 0) {
    console.error("Error: Input data is missing or empty.");
    return null;
  }

  // Extract the first line which should contain the triangle's dimensions.
  // Use filter(Boolean) to prevent issues with multiple spaces between numbers.
  const numericStringComponents = inputDataLines[0].split(' ').filter(Boolean);

  // Validate that we received the expected number of components.
  const EXPECTED_COMPONENT_COUNT = 3;
  if (numericStringComponents.length < EXPECTED_COMPONENT_COUNT) {
    console.error(`Error: Insufficient numeric inputs. Expected ${EXPECTED_COMPONENT_COUNT} values (side A, side B, angle), but received ${numericStringComponents.length}.`);
    return null;
  }

  // Attempt to parse the string components into floating-point numbers.
  const rawSideA = parseFloat(numericStringComponents[0]);
  const rawSideB = parseFloat(numericStringComponents[1]);
  const rawAngleDegrees = parseFloat(numericStringComponents[2]);

  // Comprehensive validation for parsed numeric values.
  if (isNaN(rawSideA) || isNaN(rawSideB) || isNaN(rawAngleDegrees)) {
    console.error("Error: One or more input values are not valid numbers.");
    return null;
  }
  if (rawSideA <= 0 || rawSideB <= 0) {
    console.error("Error: Side lengths (A and B) must be strictly positive.");
    return null;
  }
  if (rawAngleDegrees <= 0 || rawAngleDegrees >= 180) {
    console.error("Error: The included angle must be greater than 0 and less than 180 degrees.");
    return null;
  }

  // Assign validated values to descriptive constants.
  const firstSideLength = rawSideA;
  const secondSideLength = rawSideB;
  const includedAngleInDegrees = rawAngleDegrees;

  // Define a constant for the conversion factor from degrees to radians.
  // This improves readability and avoids 'magic numbers'.
  const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;

  // Convert the included angle from degrees to radians, as trigonometric functions expect radians.
  const includedAngleInRadians = includedAngleInDegrees * DEGREES_TO_RADIANS_FACTOR;

  // Pre-calculate squares of the known sides for the Law of Cosines.
  const squareOfFirstSide = firstSideLength * firstSideLength;
  const squareOfSecondSide = secondSideLength * secondSideLength;

  // Calculate the cosine of the included angle once to reuse it.
  const cosineOfIncludedAngle = Math.cos(includedAngleInRadians);

  // Apply the Law of Cosines to determine the square of the third side.
  // Formula: c^2 = a^2 + b^2 - 2ab * cos(C)
  let squareOfThirdSide = squareOfFirstSide + squareOfSecondSide - (2 * firstSideLength * secondSideLength * cosineOfIncludedAngle);

  // Guard against potential floating-point inaccuracies that might result in a tiny negative value.
  // A negative value under the square root would lead to NaN.
  squareOfThirdSide = Math.max(0, squareOfThirdSide);

  // Calculate the actual length of the third side.
  const thirdSideLength = Math.sqrt(squareOfThirdSide);

  // Calculate the sine of the included angle, needed for the area calculation.
  const sineOfIncludedAngle = Math.sin(includedAngleInRadians);

  // Calculate the area of the triangle using the formula: Area = 0.5 * a * b * sin(C).
  const calculatedTriangleArea = 0.5 * firstSideLength * secondSideLength * sineOfIncludedAngle;

  // Determine the total perimeter of the triangle.
  const totalTrianglePerimeter = firstSideLength + secondSideLength + thirdSideLength;

  // Calculate the height corresponding to the first side (base 'a').
  // Formula: Height = (2 * Area) / base
  const heightRelativeToFirstSide = (2 * calculatedTriangleArea) / firstSideLength;

  // Return all calculated properties encapsulated in an object.
  return {
    area: calculatedTriangleArea,
    perimeter: totalTrianglePerimeter,
    height: heightRelativeToFirstSide,
  };
}

// --- Standard Input Processing Logic (Node.js Environment) ---
// This section is responsible for reading input from stdin and orchestrating the calculations.

// An array to accumulate Buffer chunks received from stdin.
let receivedDataChunks = [];

// Register an event listener for when data is available on stdin.
process.stdin.on('data', (dataFragment) => {
  // Each 'data' event provides a Buffer chunk; push it into our array.
  receivedDataChunks.push(dataFragment);
});

// Register an event listener for when the stdin stream has ended.
process.stdin.on('end', () => {
  // Concatenate all accumulated Buffer chunks into a single Buffer.
  const combinedInputBuffer = Buffer.concat(receivedDataChunks);
  // Convert the combined buffer to a string using UTF-8 encoding.
  const completeInputString = combinedInputBuffer.toString('utf8');
  // Split the string into individual lines based on the newline character.
  const inputLinesArray = completeInputString.split('\n');

  // Invoke the main triangle processing function with the gathered input lines.
  const triangleResults = processTriangleMeasurements(inputLinesArray);

  // Check if the calculation was successful (i.e., no validation errors occurred).
  if (triangleResults) {
    // Format each result using our helper function and join them with a space.
    const formattedOutputString = [
      formatToSixDecimalPlaces(triangleResults.area),
      formatToSixDecimalPlaces(triangleResults.perimeter),
      formatToSixDecimalPlaces(triangleResults.height),
    ].join(' ');

    // Print the final formatted output to standard output.
    console.log(formattedOutputString);
  } else {
    // If triangleResults is null, an error message would have already been
    // logged by `processTriangleMeasurements`. No further action here.
  }
});

// Optional: Add an error handler for the stdin stream itself.
process.stdin.on('error', (err) => {
  console.error("An unhandled error occurred while reading from standard input:", err.message);
  // Exit the process with a non-zero status code to indicate an error.
  process.exit(1);
});