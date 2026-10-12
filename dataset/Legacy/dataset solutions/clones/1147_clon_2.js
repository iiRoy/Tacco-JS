/**
 * Processes raw input data to calculate the Levenshtein distance between two strings.
 * This function implements the dynamic programming approach for edit distance.
 * @param {string} rawData The raw input string, expected to contain two lines separated by a newline.
 */
function ProcessInput(rawData) {
  // Split the incoming raw data into individual line segments.
  const lineSegments = rawData.split("\n");

  // Extract the first string from the segments.
  const firstString = lineSegments[0];

  // Extract the second string from the segments.
  const secondString = lineSegments[1];

  // Determine the length of the first string.
  const lenOne = firstString.length;

  // Determine the length of the second string.
  const lenTwo = secondString.length;

  // Initialize a 2D array (matrix) to store the edit distances.
  // This matrix will be used for dynamic programming.
  const distanceMatrix = [];

  // Populate the first column of the distance matrix.
  // This represents the cost of transforming an empty string to a prefix of the first string.
  for (let rowIdx = 0x0; rowIdx <= lenOne; rowIdx++) {
    distanceMatrix[rowIdx] = []; // Initialize the current row as an empty array.
    distanceMatrix[rowIdx][0x0] = rowIdx; // The cost is simply the length of the prefix.
  }

  // Populate the first row of the distance matrix.
  // This represents the cost of transforming an empty string to a prefix of the second string.
  for (let colIdx = 0x0; colIdx <= lenTwo; colIdx++) {
    distanceMatrix[0x0][colIdx] = colIdx; // The cost is simply the length of the prefix.
  }

  // Fill the rest of the distance matrix using dynamic programming.
  // Iterate through each character of the first string.
  for (let rowIdx = 0x1; rowIdx <= lenOne; rowIdx++) {
    // Iterate through each character of the second string.
    for (let colIdx = 0x1; colIdx <= lenTwo; colIdx++) {
      // Calculate the cost of a substitution.
      // If characters match, cost is 0; otherwise, cost is 1.
      const substitutionCost = (firstString[rowIdx - 0x1] === secondString[colIdx - 0x1]) ? 0x0 : 0x1;

      // Determine the minimum edit distance for the current cell.
      // This involves considering three possibilities:
      // 1. Deletion: distanceMatrix[rowIdx - 1][colIdx] + 1
      // 2. Insertion: distanceMatrix[rowIdx][colIdx - 1] + 1
      // 3. Substitution: distanceMatrix[rowIdx - 1][colIdx - 1] + substitutionCost
      distanceMatrix[rowIdx][colIdx] = Math.min(
        Math.min(distanceMatrix[rowIdx - 0x1][colIdx] + 0x1, distanceMatrix[rowIdx][colIdx - 0x1] + 0x1),
        distanceMatrix[rowIdx - 0x1][colIdx - 0x1] + substitutionCost
      );
    }
  }

  // The final Levenshtein distance is stored in the bottom-right cell of the matrix.
  console.log(distanceMatrix[lenOne][lenTwo]);
}

// Execute the main processing function by reading input from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
