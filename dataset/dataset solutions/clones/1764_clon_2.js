const makeMemoKey = (rowIdx, colIdx) => `row${rowIdx}col${colIdx}`;

// A persistent storage for memoized results of computations.
const resultsCache = new Map();

// This function performs a recursive calculation based on four BigInt parameters.
const computeValue = (startRow, startCol, endRow, endCol) => {
  // Generate a unique identifier for the current state (endRow, endCol) for caching.
  const currentKey = makeMemoKey(endRow, endCol);

  // If the result for this state is already computed and stored, return it directly.
  if (resultsCache.has(currentKey)) {
    return resultsCache.get(currentKey);
  }

  // Declare a variable to hold the final computed outcome for the current call.
  let outcome;

  // First base case: if the starting row index is equal to the ending row index.
  if (startRow === endRow) {
    outcome = (startRow ** (endCol - startCol)) % 998244353n;
  }
  // Second base case: if the starting column index is equal to the ending column index.
  else if (startCol === endCol) {
    outcome = (startCol ** (endRow - startRow)) % 998244353n;
  }
  // Recursive step: for all other cases, apply a complex recurrence relation.
  else {
    outcome = (
      computeValue(startRow, startCol, endRow - 1n, endCol) * endCol +
      computeValue(startRow, startCol, endRow, endCol - 1n) * endRow -
      computeValue(startRow, startCol, endRow - 1n, endCol - 1n) * (endRow - 1n) * (endCol - 1n)
    ) % 998244353n;
  }

  // Store the newly calculated outcome in the cache before returning it.
  resultsCache.set(makeMemoKey(endRow, endCol), outcome);

  return outcome; // Return the final computed value.
};

// The main entry point function to handle input parsing and trigger the calculation.
const processInputAndRun = (rawInputString) => {
  // Split the raw input string into an array of lines.
  const inputLines = rawInputString.split("\n");

  // Parse the first line of input to extract the four BigInt parameters.
  const [initialR, initialC, finalR, finalC] = inputLines[0].split(" ").map(val => BigInt(val));

  // Execute the primary calculation and print the result, converted to a standard Number.
  console.log(Number(computeValue(initialR, initialC, finalR, finalC)));
};

// Read input from standard input and then invoke the main processing function.
processInputAndRun(require("fs").readFileSync("/dev/stdin", "utf8"));