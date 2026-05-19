(function programEntry() {
  // Retrieve all input lines from the standard input stream.
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Extract the size of the first array and its elements.
  const countElements = Number(inputLines.shift());
  const elementValues = inputLines.shift().split(' ').map(Number);

  // Extract the size of the second array and its target sum values.
  const countTargets = Number(inputLines.shift());
  const targetValues = inputLines.shift().split(' ').map(Number);

  /**
   * Determines if a subset of `elementValues` (starting from `idx`)
   * can sum up to the `currentTarget`.
   * This is a recursive function implementing the subset sum problem.
   *
   * @param {number} idx - The current index in the `elementValues` array.
   * @param {number} currentTarget - The remaining sum that needs to be achieved.
   * @returns {boolean} `true` if a subset sum is found, `false` otherwise.
   */
  const checkSubsetSum = (idx, currentTarget) => {
    if (currentTarget === 0) {
      return true; // A subset summing to the target has been found.
    }
    if (idx >= countElements) {
      return false; // All elements processed, target not met.
    }

    // Explore two possibilities:
    // 1. Exclude the element at the current index `idx`.
    // 2. Include the element at the current index `idx` (if it doesn't exceed the target).
    let possible = checkSubsetSum(idx + 1, currentTarget) || checkSubsetSum(idx + 1, currentTarget - elementValues[idx]);
    return possible;
  };

  // For each target value in `targetValues`, check if it can be formed
  // by a subset of `elementValues` and print 'yes' or 'no'.
  targetValues.map(singleTarget => checkSubsetSum(0, singleTarget) ? 'yes' : 'no').forEach(outcomeMessage => console.log(outcomeMessage));
})();
