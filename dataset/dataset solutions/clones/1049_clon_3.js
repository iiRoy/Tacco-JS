(function executeProgramLogic() {
  // Define constants for file paths and output strings.
  const STANDARD_INPUT_PATH = '/dev/stdin';
  const POSITIVE_RESULT_STRING = 'yes';
  const NEGATIVE_RESULT_STRING = 'no';

  // Obtain the file system utility module.
  const fileSystemUtility = require('fs');

  /**
   * Converts a string to an integer using base 10.
   * @param {string} inputString The string to convert.
   * @returns {number} The parsed integer.
   */
  const convertStringToInteger = (inputString) => parseInt(inputString, 10);

  // Read the entire input stream, decode it as UTF-8,
  // remove any leading/trailing whitespace, and split it into an array of lines.
  const rawInputLines = fileSystemUtility.readFileSync(STANDARD_INPUT_PATH, 'utf8').trim().split('\n');

  // Perform a preliminary check for sufficient input lines.
  // We expect at least four lines: N1, Arr1, N2, Arr2.
  if (rawInputLines.length < 4) {
    console.error("Input error: Not enough data lines provided. Expected at least 4.");
    return;
  }

  // Extract and parse the declared size of the first array (primary data set).
  const primaryDataSetDeclaredSize = convertStringToInteger(rawInputLines.shift());
  // Extract and parse the elements of the first array.
  const primaryDataSet = rawInputLines.shift().split(' ').map(convertStringToInteger);

  // Extract and parse the declared size of the second array (target sums).
  // This value (secondaryDataSetDeclaredSize) is read as per input format,
  // but its specific numerical value is not directly used in the subset sum logic.
  // It consumes the line and can be used for input validation.
  const secondaryDataSetDeclaredSize = convertStringToInteger(rawInputLines.shift());
  // Extract and parse the elements of the second array (sums to check).
  const targetSumsToCheck = rawInputLines.shift().split(' ').map(convertStringToInteger);

  // Optional: Add validation for actual versus declared array sizes.
  if (primaryDataSet.length !== primaryDataSetDeclaredSize) {
    console.warn("Input warning: Actual primary dataset size differs from declared size.");
  }
  if (targetSumsToCheck.length !== secondaryDataSetDeclaredSize) {
    console.warn("Input warning: Actual target sums count differs from declared count.");
  }

  // Initialize a memoization cache (dynamic programming table) to store results
  // of subproblems for the subset sum calculation.
  // The keys will be strings like "currentIndex-requiredSum".
  const subsetSumMemoCache = new Map();

  /**
   * Recursively determines if a specific target sum can be formed using elements
   * from the `primaryDataSet` starting from a given index.
   * This function uses memoization to avoid redundant computations.
   *
   * @param {number} currentElementIndex The index of the current element in `primaryDataSet` to consider.
   * @param {number} requiredSum The remaining sum that needs to be achieved.
   * @returns {boolean} `true` if `requiredSum` is achievable, `false` otherwise.
   */
  const checkSubsetSumPossibility = (currentElementIndex, requiredSum) => {
    // Construct a unique key for the cache based on the current state (index and sum).
    const cacheKey = `${currentElementIndex}-${requiredSum}`;

    // If the result for this specific subproblem is already in the cache, return it immediately.
    if (subsetSumMemoCache.has(cacheKey)) {
      return subsetSumMemoCache.get(cacheKey);
    }

    // Base Case 1: If the required sum is exactly zero, it means we've found a subset.
    if (requiredSum === 0) {
      subsetSumMemoCache.set(cacheKey, true);
      return true;
    }

    // Base Case 2: If we've processed all available elements, or if the required sum
    // has become negative (and is not zero, handled above), then it's not possible to form the sum.
    if (currentElementIndex >= primaryDataSet.length || requiredSum < 0) {
      subsetSumMemoCache.set(cacheKey, false);
      return false;
    }

    // Recursive Step: Explore two distinct paths for the current element:
    // Path A: Exclude the current element from the subset.
    //   Move to the next element without changing the required sum.
    const resultIfSkippingElement = checkSubsetSumPossibility(currentElementIndex + 1, requiredSum);

    // Path B: Include the current element in the subset.
    //   Move to the next element, reducing the required sum by the current element's value.
    const resultIfIncludingElement = checkSubsetSumPossibility(currentElementIndex + 1, requiredSum - primaryDataSet[currentElementIndex]);

    // The target sum is achievable if *either* excluding *or* including the current element
    // leads to a successful solution.
    const finalOutcome = resultIfSkippingElement || resultIfIncludingElement;

    // Store the computed result in the cache before returning it, to optimize future calls.
    subsetSumMemoCache.set(cacheKey, finalOutcome);
    return finalOutcome;
  };

  /**
   * Helper function to output results to the console.
   * @param {string} message The message string to display.
   */
  function displayOutputLine(message) {
    console.log(message);
  }

  // Iterate through each target sum provided in the input.
  for (const singleTargetValue of targetSumsToCheck) {
    // For each target sum, invoke the subset sum checker starting from the first element (index 0).
    const isThisTargetAchievable = checkSubsetSumPossibility(0, singleTargetValue);

    // Based on the boolean result, output the corresponding string.
    displayOutputLine(isThisTargetAchievable ? POSITIVE_RESULT_STRING : NEGATIVE_RESULT_STRING);
  }
})();