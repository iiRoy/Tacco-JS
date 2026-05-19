'use strict';

/**
 * Processes the given input string to find the number of valid triangles.
 * A triangle is valid if the sum of any two sides is greater than the third side.
 * The input consists of a number N on the first line, followed by N space-separated
 * integers on the second line, representing the lengths of potential triangle sides.
 * @param {string} inputString The raw input data from stdin.
 */
function processInput(inputString) {
  // Clean up the input and split it into lines.
  let processedLines = inputString.trim().split('\n');

  // The first line contains the count of elements.
  const countElements = Number(processedLines.shift());

  // The second line contains the side lengths.
  // Parse them as numbers and sort them in ascending order.
  // Sorting helps optimize the triangle check.
  processedLines = processedLines[0].split(' ').map(val => Number(val)).sort((valA, valB) => valA - valB);

  /**
   * Determines if three given side lengths can form a valid triangle.
   * @param {number} sideA Length of the first side.
   * @param {number} sideB Length of the second side.
   * @param {number} sideC Length of the third side.
   * @returns {boolean} True if a valid triangle can be formed, false otherwise.
   */
  const isValidTriangle = (sideA, sideB, sideC) => {
    return (sideA + sideB > sideC) && (sideA + sideC > sideB) && (sideB + sideC > sideA);
  };

  let totalTriangles = 0; // Counter for valid triangles found.

  // Iterate through all unique combinations of three distinct side lengths.
  // The outer loop picks the first side.
  for (let idx1 = 0; idx1 < countElements; idx1++) {
    // The middle loop picks the second side, ensuring it's distinct and larger than the first.
    for (let idx2 = idx1 + 1; idx2 < countElements; idx2++) {
      // The inner loop picks the third side, ensuring it's distinct and larger than the second.
      for (let idx3 = idx2 + 1; idx3 < countElements; idx3++) {
        // Optimization: If the sum of the two smaller sides is already less than the largest side,
        // then any subsequent larger third sides will also fail the triangle inequality.
        // Since the array is sorted, we can break early.
        if (processedLines[idx1] + processedLines[idx2] < processedLines[idx3]) {
          break;
        }
        // Check if the current combination of three sides forms a valid triangle.
        if (isValidTriangle(processedLines[idx1], processedLines[idx2], processedLines[idx3])) {
          totalTriangles++; // Increment the counter if it's a valid triangle.
        }
      }
    }
  }

  // Output the final count of valid triangles.
  console.log(totalTriangles);
}

// Read the entire input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
