const fileSystem = require('fs');

const standardInputPath = '/dev/stdin';

const rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8');

// --- Input Parsing and Validation ---

// Split the raw input into an array of lines.
const processedLines = rawInputData.trim().split('\n');

// Basic input validation: ensure we have at least the minimum required lines.
if (processedLines.length < 4) {
  console.error("Input error: Not enough lines provided in standard input.");
  process.exit(1);
}

// Extract and convert the total number of elements.
const totalElements = parseInt(processedLines[0], 10);

// Extract, trim, split, and convert the array of element values to numbers.
// This ensures all elements are numbers upfront, preventing implicit conversions later.
const elementValues = processedLines[1].trim().split(' ').map(numStr => parseInt(numStr, 10));

// Extract and convert the total number of queries.
const numberOfQueries = parseInt(processedLines[2], 10);

// Extract, trim, split, and convert the array of target sums for the queries.
const queryTargetSums = processedLines[3].trim().split(' ').map(numStr => parseInt(numStr, 10));

// --- Custom Key Management for Memoization ---

/**
 * @class CachePathResolver
 * @description Provides a mechanism to generate and navigate nested plain objects,
 *              serving as a multi-level key structure for memoization.
 */
class CachePathResolver {
  constructor() {
    this.storageRoot = {}; // The base object for all nested keys.
  }

  /**
   * @method resolvePath
   * @description Traverses or constructs a path of nested objects using provided key segments.
   *              Returns the object at the deepest level of the path.
   * @param {...any} segments - Variable arguments representing parts of a composite key.
   * @returns {object} The object at the end of the resolved path.
   */
  resolvePath(...segments) {
    let currentPointer = this.storageRoot;

    // Iterate through each segment to build or find the path.
    for (let i = 0; i < segments.length; i++) {
      const segmentKey = segments[i];
      // If the next level doesn't exist for this segment, create it as an empty object.
      if (typeof currentPointer[segmentKey] === 'undefined') {
        currentPointer[segmentKey] = {};
      }
      // Move the pointer to the next level.
      currentPointer = currentPointer[segmentKey];
    }
    // Return the final object reached by the path.
    return currentPointer;
  }
}

// --- Dynamic Programming Setup ---

// A standard JavaScript Map to store computed results for memoization.
const resultsCache = new Map();

// An instance of our custom key resolver to manage composite keys for the cache.
const cacheKeyManager = new CachePathResolver();

/**
 * @function determineSubsetSum
 * @description A recursive function with memoization to check if a subset of `elementValues`
 *              (starting from `elementIndex`) can sum up to `targetValue`.
 * @param {number} elementIndex - The current index in the `elementValues` array.
 * @param {number} targetValue - The remaining target sum to achieve.
 * @returns {boolean} True if the target sum can be formed, false otherwise.
 */
const determineSubsetSum = (elementIndex, targetValue) => {
  // Construct a unique key for the current state (elementIndex, targetValue).
  const stateKey = cacheKeyManager.resolvePath(elementIndex, targetValue);

  // If this state has already been computed, return the cached result.
  if (resultsCache.has(stateKey)) {
    return resultsCache.get(stateKey);
  }

  // --- Base Conditions ---

  // If the target sum drops below zero, it's impossible to achieve with non-negative elements.
  if (targetValue < 0) {
    return false;
  }

  // If we've iterated past all available elements.
  if (elementIndex >= totalElements) {
    // If the target is exactly zero, we found a valid subset (the empty set).
    return targetValue === 0;
  }

  // If the target is already zero, we've successfully found a subset.
  if (targetValue === 0) {
    return true;
  }

  // --- Recursive Decisions ---

  // Option A: Exclude the current element.
  // Move to the next element without changing the target.
  const outcomeWithoutCurrent = determineSubsetSum(elementIndex + 1, targetValue);

  // Option B: Include the current element.
  // Move to the next element and subtract the current element's value from the target.
  const outcomeWithCurrent = determineSubsetSum(elementIndex + 1, targetValue - elementValues[elementIndex]);

  // The final result for this state is true if either option leads to a solution.
  const finalOutcome = outcomeWithoutCurrent || outcomeWithCurrent;

  // Store the computed result in the cache before returning.
  resultsCache.set(stateKey, finalOutcome);

  return finalOutcome;
};

// --- Process Queries and Output Results ---

// Iterate through each target sum provided in the input queries.
for (const currentQueryTarget of queryTargetSums) {
  // Perform a quick check for invalid target sums.
  if (currentQueryTarget < 0) {
    console.log('no'); // Negative targets cannot be formed by non-negative elements.
    continue; // Proceed to the next query.
  }

  // Call the main DP function to check if the current target sum is achievable.
  const isPossible = determineSubsetSum(0, currentQueryTarget);

  // Print 'yes' or 'no' based on the result.
  console.log(isPossible ? 'yes' : 'no');
}

// Uncomment the line below for internal debugging of the cache state.
// console.log("Final state of the memoization cache:", resultsCache);