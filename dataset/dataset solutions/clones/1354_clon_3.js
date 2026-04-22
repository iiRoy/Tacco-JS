process.stdin.resume();

// Configure the standard input stream to use UTF-8 encoding.
const INPUT_DATA_ENCODING = 'utf8';
process.stdin.setEncoding(INPUT_DATA_ENCODING);

// Define the numerical base for integer parsing.
const NUMERIC_BASE_10 = 10;

/**
 * Computes the rectangular area and the total perimeter based on provided length and width.
 * Includes basic validation for non-negative dimensions.
 * @param {number} rectangleLength - The length of the rectangle.
 * @param {number} rectangleWidth - The width of the rectangle.
 * @returns {{computedSurfaceArea: number, computedBoundaryLength: number}} An object containing the calculated area and perimeter.
 */
function calculateRectangleMetrics(rectangleLength, rectangleWidth) {
  // Essential check: ensure dimensions are valid positive numbers.
  if (isNaN(rectangleLength) || isNaN(rectangleWidth) || rectangleLength < 0 || rectangleWidth < 0) {
    console.error("Warning: Invalid or negative dimensions detected. Returning zero for metrics.");
    return { computedSurfaceArea: 0, computedBoundaryLength: 0 };
  }

  const computedSurfaceArea = rectangleLength * rectangleWidth;
  const computedBoundaryLength = 2 * (rectangleLength + rectangleWidth); // Standard perimeter formula

  return { computedSurfaceArea, computedBoundaryLength };
}

// Register an event listener for incoming data chunks from standard input.
process.stdin.on('data', (inputSegmentBuffer) => {
  // Normalize input: remove leading/trailing whitespace and split by any sequence of whitespace characters.
  const stringDimensionsArray = inputSegmentBuffer.trim().split(/\s+/);

  // Validate the number of input parts. Expecting exactly two.
  if (stringDimensionsArray.length !== 2) {
    console.error(`Processing Error: Expected two numerical inputs, but received ${stringDimensionsArray.length} parts. Input was: "${inputSegmentBuffer.trim()}"`);
    return; // Abort processing for this invalid input line.
  }

  // Use array destructuring to extract the two dimension strings.
  const [firstDimensionString, secondDimensionString] = stringDimensionsArray;

  // Convert string dimensions to integer values using the defined numeric base.
  const primaryDimension = parseInt(firstDimensionString, NUMERIC_BASE_10);
  const secondaryDimension = parseInt(secondDimensionString, NUMERIC_BASE_10);

  // Additional validation: check if parsing resulted in actual numbers.
  if (isNaN(primaryDimension) || isNaN(secondaryDimension)) {
    console.error(`Data Conversion Error: Failed to parse "${firstDimensionString}" or "${secondDimensionString}" into valid integers.`);
    return; // Skip this erroneous input.
  }

  // Utilize the dedicated helper function to compute the required metrics.
  const { computedSurfaceArea: finalComputedArea, computedBoundaryLength: finalComputedPerimeter } =
    calculateRectangleMetrics(primaryDimension, secondaryDimension);

  // Present the results to standard output, maintaining the original space-separated format.
  console.log(`${finalComputedArea} ${finalComputedPerimeter}`);
});

// An optional listener for the 'end' event, indicating that the input stream has closed.
// This is not strictly required for the core functionality but can be useful for debugging or finalization.
/*
process.stdin.on('end', () => {
  // console.log("Standard input stream has concluded.");
});
*/