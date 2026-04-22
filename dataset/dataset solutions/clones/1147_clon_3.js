/**
 * Core module for processing raw text input and calculating string dissimilarities.
 * This implementation focuses on the Levenshtein distance algorithm, a metric for
 * quantifying the difference between two sequences.
 *
 * @param {string} rawInputData - The complete string input, expected to contain
 *                                at least two lines separated by newline characters.
 *                                The first line is treated as the source string,
 *                                and the second as the target string.
 */
const calculateLevenshteinDistance = (rawInputData) => {
  // Define a constant for the cost of an insertion or deletion operation.
  // In standard Levenshtein distance, this cost is typically 1.
  const INSERTION_DELETION_PENALTY = 1;

  // Process the incoming raw data by splitting it into individual lines.
  const inputLines = rawInputData.split('\n');

  // Basic validation: Ensure we have at least two distinct lines for comparison.
  // If not, handle edge cases where one or both strings might be missing.
  if (inputLines.length < 2) {
    // If only one line, consider it as comparing to an empty string, so its length is the distance.
    // If no lines, distance is zero. This is a simplified guard.
    console.log(inputLines.length === 1 ? inputLines[0].trim().length : 0);
    return;
  }

  // Extract the primary and secondary strings, removing any leading/trailing whitespace.
  const firstString = inputLines[0].trim();
  const secondString = inputLines[1].trim();

  // Obtain the effective lengths of the cleaned strings.
  const lengthOfFirst = firstString.length;
  const lengthOfSecond = secondString.length;

  // Initialize a 2D array (matrix) to store the computed edit distances.
  // The matrix dimensions are (lengthOfFirst + 1) by (lengthOfSecond + 1)
  // to accommodate empty string comparisons (represented by row/column 0).
  let editCostMatrix = Array.from({ length: lengthOfFirst + 1 }, () =>
    Array.from({ length: lengthOfSecond + 1 }, () => 0)
  );

  // Helper function to determine the cost of substituting one character for another.
  // If characters are identical, the cost is 0; otherwise, it's 1.
  const determineSubstitutionCost = (charA, charB) => {
    return (charA === charB) ? 0 : 1;
  };

  // Populate the initial row of the matrix.
  // This represents the cost of transforming an empty string into a prefix of the second string.
  for (let currentColumnIndex = 0; currentColumnIndex <= lengthOfSecond; currentColumnIndex++) {
    editCostMatrix[0][currentColumnIndex] = currentColumnIndex * INSERTION_DELETION_PENALTY;
  }

  // Populate the initial column of the matrix.
  // This represents the cost of transforming a prefix of the first string into an empty string.
  for (let currentRowIndex = 0; currentRowIndex <= lengthOfFirst; currentRowIndex++) {
    editCostMatrix[currentRowIndex][0] = currentRowIndex * INSERTION_DELETION_PENALTY;
  }

  // Iterate through the remainder of the matrix to calculate the minimum edit distances
  // for all possible substrings.
  for (let r = 1; r <= lengthOfFirst; r++) {
    for (let c = 1; c <= lengthOfSecond; c++) {
      // Retrieve the characters currently being compared.
      const charA = firstString.charAt(r - 1);
      const charB = secondString.charAt(c - 1);

      // Calculate the cost if the operation was a deletion from the first string.
      const costIfDeletion = editCostMatrix[r - 1][c] + INSERTION_DELETION_PENALTY;

      // Calculate the cost if the operation was an insertion into the first string.
      const costIfInsertion = editCostMatrix[r][c - 1] + INSERTION_DELETION_PENALTY;

      // Calculate the cost if the operation was a substitution. This depends on
      // whether the characters are the same or different.
      const costIfSubstitution = editCostMatrix[r - 1][c - 1] + determineSubstitutionCost(charA, charB);

      // The value for the current cell is the minimum of these three possibilities.
      // This explicitly breaks down the Math.min operation for clarity.
      let currentCellMinimum = costIfDeletion;
      if (costIfInsertion < currentCellMinimum) {
        currentCellMinimum = costIfInsertion;
      }
      if (costIfSubstitution < currentCellMinimum) {
        currentCellMinimum = costIfSubstitution;
      }

      editCostMatrix[r][c] = currentCellMinimum;
    }
  }

  // The final Levenshtein distance is stored in the bottom-right cell of the matrix.
  console.log(editCostMatrix[lengthOfFirst][lengthOfSecond]);
};

// Initiate the distance calculation by reading input from standard I/O.
// This assumes a Node.js environment where 'fs' module is available
// and input is provided via '/dev/stdin'.
calculateLevenshteinDistance(require("fs").readFileSync("/dev/stdin", "utf8"));