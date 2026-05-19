/**
 * Processes raw input data to compute and display path counts
 * based on a specific distance calculation logic.
 *
 * @param {string} incomingData - The complete input string, typically read from standard input.
 */
function solveProblem(incomingData) {
  /**
   * Computes the effective distance between two points, considering a direct path
   * and an alternative path that routes through two special points.
   *
   * @param {number} firstPoint - The starting point.
   * @param {number} secondPoint - The ending point.
   * @returns {number} The minimum of the direct and alternative path distances.
   */
  function calculateDistance(firstPoint, secondPoint) {
    // Calculate the direct distance between the two points.
    const directPathLength = secondPoint - firstPoint;

    // Calculate the distance via the special points (specialNodeX, specialNodeY).
    // This involves moving from firstPoint to specialNodeX, then from specialNodeY to secondPoint,
    // plus an additional unit for the connection between specialNodeX and specialNodeY.
    const alternativePathLength = Math.abs(specialNodeX - firstPoint) + Math.abs(specialNodeY - secondPoint) + 1;

    // Return the shorter of the two calculated path lengths.
    return Math.min(directPathLength, alternativePathLength);
  }

  // Split the input string by spaces to get individual numerical components.
  const parsedValues = incomingData.split(' ');

  // Extract the total number of nodes (N), and the coordinates of the special points (X, Y).
  // These values are initially strings and will be implicitly coerced to numbers during arithmetic operations.
  const totalNodes = parsedValues[0];
  const specialNodeX = parsedValues[1];
  const specialNodeY = parsedValues[2];

  // Iterate through each possible path length, from 1 up to (totalNodes - 1).
  for (let currentPathLength = 1; currentPathLength < totalNodes; currentPathLength++) {
    let frequencyCount = 0; // Initialize a counter for pairs having the current path length.

    // Iterate through all possible starting points (firstPoint) from 1 to (totalNodes - 1).
    for (let firstPoint = 1; firstPoint < totalNodes; firstPoint++) {
      // For each starting point, iterate through all possible ending points (secondPoint)
      // that are greater than the starting point, up to totalNodes.
      for (let secondPoint = firstPoint + 1; secondPoint <= totalNodes; secondPoint++) {
        // If the distance between the current pair of points matches the current path length,
        // increment the frequency counter.
        if (calculateDistance(firstPoint, secondPoint) === currentPathLength) {
          frequencyCount++;
        }
      }
    }

    // Output the total count of pairs found for the current path length.
    console.log(frequencyCount);
  }
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to the problem-solving function.
solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
