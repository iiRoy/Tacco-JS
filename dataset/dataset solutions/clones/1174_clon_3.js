// This JavaScript module is responsible for calculating various geometric attributes
// of a triangle given two side lengths and the angle between them.
// It retrieves input from a specified file path, processes the data,
// and outputs the calculated area, perimeter, and altitude.

/**
 * Orchestrates the entire process of reading triangle dimensions,
 * performing necessary calculations, and presenting the results.
 * Handles input parsing, data validation, and trigonometric computations.
 */
function computeTriangleProperties() {
  // Use the Node.js file system module to interact with the file system.
  const fileIOModule = require('fs');
  // Define the standard input file path, common in competitive programming environments.
  const dataInputSource = '/dev/stdin';

  let rawFileContents;
  try {
    // Synchronously read the entire content of the specified file.
    // The 'utf8' encoding ensures proper string conversion from the buffer.
    rawFileContents = fileIOModule.readFileSync(dataInputSource, 'utf8');
  } catch (fileReadError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error(`Fatal error: Could not read input from "${dataInputSource}". Details: ${fileReadError.message}`);
    process.exit(1); // Indicate an abnormal termination.
    return; // Ensure no further execution in case of error.
  }

  // Process the raw string input: trim whitespace, split by any sequence of spaces,
  // and convert each resulting string segment into a floating-point number.
  const numericalMeasurements = rawFileContents
    .trim() // Remove leading/trailing whitespace.
    .split(/\s+/) // Split by one or more whitespace characters.
    .map(valueString => parseFloat(valueString)); // Convert to numbers.

  // Define the expected number of input parameters for robust validation.
  const REQUIRED_DIMENSION_COUNT = 3;

  // Validate that the correct number of numerical inputs was provided.
  if (numericalMeasurements.length !== REQUIRED_DIMENSION_COUNT) {
    console.error(`Input data error: Expected ${REQUIRED_DIMENSION_COUNT} numeric values, but found ${numericalMeasurements.length}.`);
    process.exit(1);
    return;
  }

  // Extract the individual triangle parameters using array destructuring.
  const firstSideLength = numericalMeasurements[0];
  const secondSideLength = numericalMeasurements[1];
  const angleDegrees = numericalMeasurements[2]; // Angle in degrees, as commonly provided.

  // Perform comprehensive validation on the extracted numerical values.
  if (isNaN(firstSideLength) || isNaN(secondSideLength) || isNaN(angleDegrees)) {
    console.error("Data parsing failure: One or more input values are not valid numbers.");
    process.exit(1);
    return;
  }
  if (firstSideLength <= 0 || secondSideLength <= 0) {
    console.error("Geometric constraint violation: Triangle side lengths must be strictly positive.");
    process.exit(1);
    return;
  }
  if (angleDegrees <= 0 || angleDegrees >= 180) {
    console.error("Geometric constraint violation: The included angle must be greater than 0 and less than 180 degrees.");
    process.exit(1);
    return;
  }

  // Pre-calculate the constant for converting degrees to radians, improving efficiency and readability.
  const RADIAN_CONVERSION_FACTOR = Math.PI / 180.0;

  // Convert the angle from degrees to radians, as trigonometric functions in JavaScript
  // (and most programming languages) expect radian input.
  const includedAngleInRadians = angleDegrees * RADIAN_CONVERSION_FACTOR;

  // Calculate the height (altitude) of the triangle with respect to the `firstSideLength` as base.
  // Formula: h = b * sin(C)
  const triangleHeight = Math.sin(includedAngleInRadians) * secondSideLength;

  // Calculate the projection of `secondSideLength` onto `firstSideLength`.
  // This value is crucial for determining the third side using the Pythagorean theorem.
  // Formula: projection = b * cos(C)
  const baseProjectionComponent = Math.cos(includedAngleInRadians) * secondSideLength;

  // Calculate the length of the third side (c) using the law of cosines,
  // which can be derived from the Pythagorean theorem applied to the two right triangles
  // formed by the altitude.
  // c^2 = (a - projection)^2 + h^2
  const baseSegmentDifference = firstSideLength - baseProjectionComponent;
  // Square the difference and the height directly using multiplication, which is often
  // slightly more performant than Math.pow(x, 2) for integer exponents.
  const squaredBaseDifference = baseSegmentDifference * baseSegmentDifference;
  const squaredHeight = triangleHeight * triangleHeight;

  const thirdSideCalculated = Math.sqrt(squaredBaseDifference + squaredHeight);

  // Compute the total area of the triangle.
  // Formula: Area = (1/2) * base * height
  const totalTriangleArea = (firstSideLength * triangleHeight) / 2.0;

  // Determine the perimeter of the triangle by summing all three side lengths.
  const trianglePerimeter = firstSideLength + secondSideLength + thirdSideCalculated;

  // Construct the final output string using a template literal for clear formatting.
  // Each calculated value is placed on a new line.
  const formattedOutput = `${totalTriangleArea}\n${trianglePerimeter}\n${triangleHeight}`;

  // Display the computed results to the standard output.
  console.log(formattedOutput);
}

// Execute the primary function to initiate the triangle calculation process.
computeTriangleProperties();