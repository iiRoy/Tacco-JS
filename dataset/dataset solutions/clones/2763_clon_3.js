// Self-executing anonymous function to encapsulate the entire program logic
((inputPayload) => {
  // Helper function to check if a numeric value represents a whole number (integer).
  // This provides a slightly different code fragment compared to directly using Number.isInteger.
  const isWholeNumber = (valueToCheck) => {
    // Basic type and finiteness check for robustness against non-numeric inputs
    if (typeof valueToCheck !== 'number' || !Number.isFinite(valueToCheck)) {
      return false; // Non-numbers or infinite values are not whole numbers
    }
    // Use the native method to confirm integer status
    return Number.isInteger(valueToCheck);
  };

  // --- Input Parsing and Validation ---

  // Split the raw input string into an array of individual lines
  const inputLines = inputPayload.split('\n');

  // Guard clause: Ensure there's at least enough input for the first line (N and D)
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
    console.error("Error: Input data is empty or malformed at the start.");
    return; // Exit if input is invalid
  }

  // Parse the first line to extract the number of points (N) and dimensions (D).
  // `trim()` removes leading/trailing whitespace, `split(/\s+/)` handles multiple spaces,
  // and `filter(Boolean)` removes any empty strings that might result from splitting.
  const firstLineTokens = inputLines[0].trim().split(/\s+/).filter(Boolean);

  // Validate that the first line contains exactly two numeric tokens (N and D)
  if (firstLineTokens.length < 2) {
    console.error("Error: The first line must contain two space-separated integers: N (number of points) and D (dimensions).");
    return;
  }

  // Convert string tokens to integers. Use `parseInt` with radix for safety.
  const pointCount = parseInt(firstLineTokens[0], 10);
  const dimensions = parseInt(firstLineTokens[1], 10);

  // Perform basic validation on the parsed N and D values
  if (isNaN(pointCount) || pointCount <= 0 || isNaN(dimensions) || dimensions <= 0) {
    console.error(`Error: Invalid N (${firstLineTokens[0]}) or D (${firstLineTokens[1]}) values. Both must be positive integers.`);
    return;
  }

  // --- Coordinate Data Extraction ---

  // Extract and parse the coordinate data for each point.
  // We slice the input lines from the second line (index 1) up to `pointCount` lines after it.
  const pointSet = inputLines.slice(1, pointCount + 1).map((lineString, originalLineIdx) => {
    // For each line, clean it, split by whitespace, filter out empty strings, and convert to numbers.
    const coordinateValues = lineString.trim().split(/\s+/).filter(Boolean).map(Number);

    // Add a validation check: ensure each point array has the expected number of dimensions.
    // This is an added guard clause for robust input handling.
    if (coordinateValues.length !== dimensions) {
      console.warn(`Warning: Point data on input line ${originalLineIdx + 2} has ${coordinateValues.length} dimensions, but ${dimensions} were expected. Data might be incomplete or malformed.`);
      // Depending on requirements, this could throw an error or attempt to pad/truncate.
      // For this clone, we proceed, but the warning is a Type III addition.
    }
    return coordinateValues;
  });

  // Final check to ensure the number of parsed points matches the declared `pointCount`
  if (pointSet.length !== pointCount) {
    console.error(`Error: Expected to parse ${pointCount} points, but only found ${pointSet.length} valid point entries.`);
    return;
  }

  // --- Main Logic: Calculate Integer Distance Pairs ---

  // Initialize a counter for pairs of points whose Euclidean distance is an integer.
  let integerDistancePairs = 0;

  // Use nested `for` loops to iterate through all unique pairs of points.
  // This is a Type III change, replacing the original nested `reduce` calls.
  // The outer loop picks the first point of a pair.
  for (let currentPointIndex = 0; currentPointIndex < pointCount; ++currentPointIndex) {
    const currentPointData = pointSet[currentPointIndex];

    // The inner loop picks the second point, ensuring it's always 'after' the first point
    // in the array. This prevents redundant checks (e.g., (A,B) and then (B,A))
    // and self-comparison (e.g., (A,A)).
    for (let subsequentPointIndex = currentPointIndex + 1; subsequentPointIndex < pointCount; ++subsequentPointIndex) {
      const subsequentPointData = pointSet[subsequentPointIndex];

      // Calculate the Euclidean distance between the two selected points using our helper.
      const calculatedMetric = calculateDistanceMetric(currentPointData, subsequentPointData, dimensions);

      // Check if the calculated distance is a whole number using our custom helper.
      if (isWholeNumber(calculatedMetric)) {
        integerDistancePairs++; // Increment the counter if it is.
      }
    }
  }

  // Output the final count of pairs that have an integer Euclidean distance.
  console.log(integerDistancePairs);

})(
  // Reads the standard input synchronously from the file system.
  require("fs").readFileSync("/dev/stdin", "utf8")
);

/**
 * Calculates the Euclidean distance between two N-dimensional points.
 * This function is a Type III clone of the original `distance` function,
 * implementing the calculation steps differently.
 *
 * @param {number[]} pointOne - The first N-dimensional point (array of coordinates).
 * @param {number[]} pointTwo - The second N-dimensional point (array of coordinates).
 * @param {number} numDimensions - The number of dimensions for the points.
 * @returns {number} The Euclidean distance between the two points.
 */
function calculateDistanceMetric(pointOne, pointTwo, numDimensions) {
  // Guard clause: If dimensions are non-positive, distance is undefined or 0.
  // This is an added guard for robustness, a Type III change.
  if (numDimensions <= 0) {
    // Depending on requirements, could throw an error or return NaN.
    // Returning 0 for simplicity if no dimensions are involved.
    return 0;
  }

  let sumOfSquaredDifferences = 0;

  // Iterate through each dimension to calculate the sum of squared differences.
  // This loop-based approach is a Type III rewrite of the original `Math.hypot.apply` method.
  for (let dimIdx = 0; dimIdx < numDimensions; ++dimIdx) {
    // Calculate the difference between coordinates in the current dimension.
    const coordinateDifference = pointOne[dimIdx] - pointTwo[dimIdx];
    // Add the square of this difference to the running total.
    sumOfSquaredDifferences += coordinateDifference * coordinateDifference;
  }

  // The Euclidean distance is the square root of the sum of these squared differences.
  return Math.sqrt(sumOfSquaredDifferences);
}