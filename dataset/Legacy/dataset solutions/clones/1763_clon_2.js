const generateCoordKey = (rowIdx, colIdx) => {
  // Creates a unique string identifier for a given row and column pair.
  return `r${rowIdx}c${colIdx}`;
};

// A cache to store previously computed results, preventing redundant calculations.
const memoizationCache = new Map();

/**
 * Recursively calculates a value based on four BigInt coordinates.
 * This function implements a specific recurrence relation with base cases.
 * @param {BigInt} startRow - The starting row coordinate.
 * @param {BigInt} startCol - The starting column coordinate.
 * @param {BigInt} endRow - The current row coordinate for calculation.
 * @param {BigInt} endCol - The current column coordinate for calculation.
 * @returns {BigInt} The computed value for the given coordinates.
 */
function computeValue(startRow, startCol, endRow, endCol) {
  // Generate a unique key for the current (endRow, endCol) pair.
  const currentKey = generateCoordKey(endRow, endCol);

  // Check if the result for this key is already in the cache.
  if (memoizationCache.has(currentKey)) {
    return memoizationCache.get(currentKey);
  }

  let resultValue; // Variable to hold the calculated result.

  // Base case 1: If the starting row equals the current row.
  if (startRow === endRow) {
    resultValue = startRow ** (endCol - startCol);
  }
  // Base case 2: If the starting column equals the current column.
  else if (startCol === endCol) {
    resultValue = startCol ** (endRow - startRow);
  }
  // Recursive case: Apply the recurrence relation.
  else {
    // The complex recursive formula involving three sub-problems.
    resultValue = computeValue(startRow, startCol, endRow - 1n, endCol) * endCol +
                  computeValue(startRow, startCol, endRow, endCol - 1n) * endRow -
                  computeValue(startRow, startCol, endRow - 1n, endCol - 1n) * (endRow - 1n) * (endCol - 1n);
  }

  // Store the computed result in the cache before returning.
  memoizationCache.set(generateCoordKey(endRow, endCol), resultValue);

  return resultValue;
}

/**
 * Main function to process input, perform calculations, and output the result.
 * @param {string} rawData - The raw input string from stdin.
 */
const processInputData = (rawData) => {
  // Split the input string into individual lines.
  const inputLines = rawData.split("\n");

  // Parse the first line of input, converting numbers to BigInt.
  const [valA, valB, valC, valD] = inputLines[0].split(" ").map(numStr => BigInt(numStr));

  // Perform the main calculation and apply a modulo operation.
  // The final result is converted back to a standard JavaScript Number for output.
  console.log(Number(computeValue(valA, valB, valC, valD) % 998244353n));
};

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
