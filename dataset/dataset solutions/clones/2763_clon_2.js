((rawData) => {
  // This script reads coordinate data from standard input,
  // then calculates the number of pairs of points whose Euclidean distance is an integer.

  // Split the entire input string into an array of lines.
  const parsedLines = rawData.split('\n');

  // The first line contains N (number of points) and D (number of dimensions).
  const firstLineParts = parsedLines[0].split(' ');
  const numPoints = Number(firstLineParts[0]); // Total number of coordinate sets
  const dimensions = Number(firstLineParts[1]); // Dimensionality of the space

  // Extract coordinate data for each point.
  // It slices the array from the second line up to N+1 lines,
  // cleans up potential double spaces, splits by space, filters out empty strings,
  // and converts each coordinate value to a number.
  const pointCoordinates = parsedLines.slice(1, numPoints + 1).map((currentLine) => {
    return currentLine.replace(/\s\s/g, ' ').split(' ').filter(Boolean).map(parseFloat);
  });

  // Output the final count of pairs with integer distances.
  console.log(
    // Use reduce to iterate through all unique pairs of points.
    pointCoordinates.reduce((totalPairs, currentPoint, idx1) => {
      // For each point, iterate through the subsequent points to form unique pairs.
      // This avoids duplicate pairs (e.g., (A, B) and (B, A)) and self-comparison (A, A).
      return totalPairs + pointCoordinates.slice(idx1 + 1).reduce((integerDistanceCount, otherPoint) => {
        // Calculate the Euclidean distance between the current pair of points.
        const calculatedDistance = calcEuclideanDistance(currentPoint, otherPoint, dimensions);

        // Check if the calculated distance is an integer.
        if (Number.isInteger(calculatedDistance)) {
          return integerDistanceCount + 1; // Increment the counter if it's an integer.
        }
        return integerDistanceCount; // Otherwise, keep the count unchanged.
      }, 0); // Initialize the inner counter for integer distances to zero.
    }, 0) // Initialize the overall total pairs counter to zero.
  );
})(
  require("fs").readFileSync("/dev/stdin", "utf8") // Read input from standard input as a UTF-8 string.
);

/**
 * Calculates the Euclidean distance between two points in N-dimensional space.
 * @param {number[]} pointOne - The coordinates of the first point.
 * @param {number[]} pointTwo - The coordinates of the second point.
 * @param {number} numDimensions - The number of dimensions (D).
 * @returns {number} The Euclidean distance between the two points.
 */
function calcEuclideanDistance(pointOne, pointTwo, numDimensions) {
  // Create an array of squared differences for each dimension.
  // Math.hypot then calculates the square root of the sum of these squares.
  return Math.hypot.apply(null, Array.from({ length: numDimensions }, (_, dimensionIndex) => {
    // Calculate the difference between coordinates along the current dimension.
    return pointOne[dimensionIndex] - pointTwo[dimensionIndex];
  }));
}
