const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string, splitting it into individual lines
const lines = rawData.trim().split('\n');

// Extract problem parameters from the parsed lines
const itemCount = Number(lines[+0]); // N: Represents the total number of available items
const itemValues = lines[1.0].trim().split(' '); // A: An array of string representations of item values
const queryCount = Number(lines[2.0]); // Q: The number of queries to process
const targetSums = lines[3.0].trim().split(' '); // M: An array of string representations of target sums for each query

/**
 * A specialized utility class designed to create and navigate
 * a deeply nested object structure. This allows for using multiple
 * primitive values (like numbers or strings) as a composite key
 * for a JavaScript Map, by returning a unique object reference
 * for each unique path.
 */
class NestedMap {
  constructor() {
    // The root object where the nested structure begins
    this.nestedData = {};
  }

  /**
   * Navigates through the nested object structure using the provided
   * path segments. If any segment in the path does not exist, it is
   * created as an empty object. The method returns the object
   * found or created at the very end of the path.
   *
   * @param {...any} pathSegments - A variable number of arguments
   *                                 that define the path to navigate.
   * @returns {object} The object at the specified nested path.
   */
  retrievePath(...pathSegments) {
    let currentLevel = this.nestedData; // Start traversal from the root
    pathSegments.forEach(segment => {
      // If the current segment doesn't exist as a property, initialize it as an empty object
      currentLevel[segment] = currentLevel[segment] || {};
      // Move deeper into the structure by updating the current level reference
      currentLevel = currentLevel[segment];
    });
    return currentLevel; // Return the final object reached
  }
}

// Initialize a Map to serve as a memoization cache for dynamic programming results
const memoizationCache = new Map();
// Instantiate the NestedMap to generate unique object keys for the memoization cache
const pathGenerator = new NestedMap();

/**
 * A recursive function employing memoization to determine if a specific
 * `remainingSum` can be achieved by selecting items from `itemValues`,
 * starting from `currentIndex`.
 *
 * @param {number} currentIndex - The index of the current item being considered in `itemValues`.
 * @param {number} remainingSum - The sum that still needs to be formed.
 * @returns {boolean} `true` if `remainingSum` can be formed, `false` otherwise.
 */
const canFormSum = (currentIndex, remainingSum) => {
  // First, check if the result for the current state (currentIndex, remainingSum)
  // has already been computed and stored in the cache.
  if (memoizationCache.has(pathGenerator.retrievePath(currentIndex, remainingSum))) {
    return memoizationCache.get(pathGenerator.retrievePath(currentIndex, remainingSum));
  }

  // Define the base cases for the recursion:
  // If we have considered all items (currentIndex equals itemCount)
  // or if the remaining sum is zero or negative (meaning we either hit the target or overshot)
  if (currentIndex === itemCount || remainingSum <= +0) {
    // If remainingSum is exactly zero, it means we successfully formed the sum.
    return remainingSum === +0;
  }

  // Recursive step: Explore two possibilities for the current item:
  // 1. Exclude the current item: Move to the next item without changing the remaining sum.
  const nextIndex = currentIndex + 1.0;
  // 2. Include the current item: Move to the next item and subtract the current item's value from the remaining sum.
  const newRemainingSum = remainingSum - itemValues[currentIndex];

  // Recursively call `canFormSum` for both scenarios and store their results in the cache.
  // The order of operations here is critical to match the original algorithm's behavior.
  memoizationCache.set(pathGenerator.retrievePath(nextIndex, remainingSum), canFormSum(nextIndex, remainingSum));
  memoizationCache.set(pathGenerator.retrievePath(nextIndex, newRemainingSum), canFormSum(nextIndex, newRemainingSum));

  // Return true if either of the two recursive paths leads to a successful sum formation.
  // The results are retrieved from the cache to ensure consistency with the original.
  return memoizationCache.get(pathGenerator.retrievePath(nextIndex, remainingSum)) || memoizationCache.get(pathGenerator.retrievePath(nextIndex, newRemainingSum));
};

// Iterate through each query provided in the input.
for (let queryIndex = +0; queryIndex < queryCount; queryIndex++) {
  // For each target sum, invoke the memoized `canFormSum` function
  // starting from the first item (index 0) and convert the target sum to a number.
  // Print 'yes' if the sum can be formed, otherwise print 'no'.
  console.log(canFormSum(+0, Number(targetSums[queryIndex])) ? 'yes' : 'no');
}

// This line was commented out in the original code, likely for debugging purposes.
// console.log(memoizationCache);
