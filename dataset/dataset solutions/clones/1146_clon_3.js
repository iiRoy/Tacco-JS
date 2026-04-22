const calculateEditDistance = (firstSequence, secondSequence) => {
  // Validate input parameters. Ensure they are treated as strings.
  if (typeof firstSequence !== 'string' || typeof secondSequence !== 'string') {
    console.error("Error: Both input arguments must be strings.");
    // For robust error handling, one might throw an exception or return a special value.
    // Following the spirit of the original, we'll assume valid string inputs for the core logic.
    // However, guarding against null/undefined is a good Type III addition.
    if (firstSequence === null || firstSequence === undefined) firstSequence = '';
    if (secondSequence === null || secondSequence === undefined) secondSequence = '';
  }

  // Pre-calculate string lengths for efficiency and readability.
  const lenFirst = firstSequence.length;
  const lenSecond = secondSequence.length;

  // Handle edge cases where one or both strings are empty.
  // If the first string is empty, the distance is the length of the second.
  if (lenFirst === 0) {
    return lenSecond;
  }
  // If the second string is empty, the distance is the length of the first.
  if (lenSecond === 0) {
    return lenFirst;
  }

  // Define a local helper function for finding the minimum of multiple values.
  // This replaces the assumed global 'min' function from the original code.
  const determineMinimum = (...valuesToCompare) => {
    let currentMin = Number.MAX_SAFE_INTEGER;
    for (const val of valuesToCompare) {
      if (val < currentMin) {
        currentMin = val;
      }
    }
    return currentMin;
  };

  // Initialize a 2D array (dynamic programming matrix) to store edit distances.
  // The matrix dimensions are (lenFirst + 1) x (lenSecond + 1).
  const dpTable = Array(lenFirst + 1).fill(null).map(() => Array(lenSecond + 1).fill(0));

  // Populate the first column: distance from an empty string to a prefix of firstSequence.
  // This represents the cost of deleting characters from firstSequence to match an empty string.
  for (let rowIdx = 0; rowIdx <= lenFirst; rowIdx++) {
    dpTable[rowIdx][0] = rowIdx;
  }

  // Populate the first row: distance from a prefix of secondSequence to an empty string.
  // This represents the cost of inserting characters into an empty string to match secondSequence.
  for (let colIdx = 0; colIdx <= lenSecond; colIdx++) {
    dpTable[0][colIdx] = colIdx;
  }

  // Fill the rest of the DP table using the specific edit distance logic provided in the original.
  // Note: The original logic is a variation of Levenshtein distance,
  // particularly in how it handles character matches and mismatches.
  // It does not strictly follow the standard Levenshtein definition for substitution costs.
  for (let r = 1; r <= lenFirst; r++) {
    for (let c = 1; c <= lenSecond; c++) {
      // Extract characters at current positions (adjusting for 0-based indexing).
      const charFromFirst = firstSequence.charAt(r - 1);
      const charFromSecond = secondSequence.charAt(c - 1);

      // Calculate the costs for the three basic operations:
      // 1. Deletion: Remove charFromFirst (cost from cell above + 1).
      const deletionOperationCost = dpTable[r - 1][c] + 1;
      // 2. Insertion: Insert charFromSecond (cost from cell to the left + 1).
      const insertionOperationCost = dpTable[r][c - 1] + 1;
      // 3. Substitution: Cost from diagonal cell.
      // In the original code's `else` branch, this value is taken directly without adding 1.
      // In a standard Levenshtein, it would be `dpTable[r-1][c-1]` if characters match,
      // and `dpTable[r-1][c-1] + 1` if characters mismatch.
      const substitutionBaseCost = dpTable[r - 1][c - 1];

      // Apply the specific conditional logic from the original code.
      if (charFromFirst === charFromSecond) {
        // If characters match, the original code takes the minimum of deletion and insertion.
        // This is a deviation from standard Levenshtein where it would typically be substitutionBaseCost.
        dpTable[r][c] = determineMinimum(deletionOperationCost, insertionOperationCost);
      } else {
        // If characters mismatch, the original code takes the minimum of deletion, insertion,
        // and the substitutionBaseCost (without adding 1 for the mismatch).
        // This is another deviation from standard Levenshtein.
        dpTable[r][c] = determineMinimum(deletionOperationCost, insertionOperationCost, substitutionBaseCost);
      }
    }
  }

  // The final edit distance is stored in the bottom-right cell of the DP table.
  return dpTable[lenFirst][lenSecond];
};

// --- Input/Output Handling Section ---
// This part handles reading input from stdin and printing the result.

// Use 'const' for variables that are not reassigned.
const filesystemModule = require('fs');

// Define a constant for the standard input path.
const standardInputPath = '/dev/stdin';

let rawInputContent;
try {
  // Read the entire content of the standard input file as a UTF-8 string.
  rawInputContent = filesystemModule.readFileSync(standardInputPath, 'utf8');
} catch (error) {
  // Add a robust error handling for file reading, a Type III addition.
  console.error(`Failed to read input from ${standardInputPath}: ${error.message}`);
  // Exit or handle gracefully if input cannot be read.
  process.exit(1);
}

// Process the raw input content.
// Trim any leading/trailing whitespace and split into an array of lines.
const inputLineArray = rawInputContent.trim().split('\n');

// Ensure there are at least two lines for the two strings.
if (inputLineArray.length < 2) {
  console.error("Error: Insufficient input. Expected at least two lines for string comparison.");
  process.exit(1);
}

// Extract the first two strings from the input array.
const firstComparisonString = inputLineArray[0];
const secondComparisonString = inputLineArray[1];

// Calculate the edit distance using the modified function.
const resultDistance = calculateEditDistance(firstComparisonString, secondComparisonString);

// Output the calculated distance to the console.
console.log(resultDistance);