const generateCoordKey = (rowIdx, colIdx) => `r${rowIdx}c${colIdx}`;

// Cache for storing previously computed results to avoid redundant calculations.
const memoizationCache = new Map();

/**
 * Recursively computes a value based on four BigInt parameters.
 * Implements memoization to optimize performance.
 *
 * @param {BigInt} valA - The first input value.
 * @param {BigInt} valB - The second input value.
 * @param {BigInt} currC - The current 'c' value in the computation.
 * @param {BigInt} currD - The current 'd' value in the computation.
 * @returns {BigInt} The computed result modulo 998244353n.
 */
const computeValue = (valA, valB, currC, currD) => {
  const cacheKey = generateCoordKey(currC, currD);

  // Check if the result for this (currC, currD) pair is already in the cache.
  if (memoizationCache.has(cacheKey)) {
    return memoizationCache.get(cacheKey);
  }

  let resultVal; // Variable to hold the calculated answer.

  // Base cases for the recursive calculation.
  if (valA === currC) {
    resultVal = (valA ** (currD - valB)) % 998244353n;
  } else if (valB === currD) {
    resultVal = (valB ** (currC - valA)) % 998244353n;
  } else {
    // Recursive step: combines results from subproblems.
    resultVal = (
      computeValue(valA, valB, currC - 1n, currD) * currD +
      computeValue(valA, valB, currC, currD - 1n) * currC -
      computeValue(valA, valB, currC - 1n, currD - 1n) * (currC - 1n) * (currD - 1n)
    ) % 998244353n;
  }

  // Store the computed result in the cache before returning.
  memoizationCache.set(generateCoordKey(currC, currD), resultVal);
  return resultVal;
};

/**
 * Main function to process input, perform calculations, and output results.
 *
 * @param {string} rawData - The raw input string, typically from stdin.
 */
const processInputAndCalculate = (rawData) => {
  const lines = rawData.split('\n');
  // Parse the four BigInt values from the first line of input.
  const [firstVal, secondVal, thirdVal, fourthVal] = lines[0].split(' ').map(strNum => BigInt(strNum));

  // Output the parsed input values in a specific format.
  console.log(`${firstVal}:${secondVal}:${thirdVal}:${fourthVal}`);

  // Compute the final result using the recursive function and output it as a Number.
  console.log(Number(computeValue(firstVal, secondVal, thirdVal, fourthVal)));
};

// Read input from standard input and pass it to the main processing function.
processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
