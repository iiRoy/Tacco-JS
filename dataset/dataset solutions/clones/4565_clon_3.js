const convertStringToInt = (inputString) => {
  // This helper function safely converts a string to an integer,
  // ensuring a base-10 interpretation.
  return parseInt(inputString, 10);
};

// The original code included several Array.prototype extensions and utility functions
// that were not utilized by the 'main' logic. As per Type III cloning,
// these unused fragments have been removed to streamline the codebase.
// Examples of removed functions: pfloat, even, odd, sortNumAsc, sortStrAsc, sortStrDesc, without.

/**
 * Extends the Array prototype to provide a method for sorting numerical arrays
 * in descending order. This modification is applied globally to all Array instances.
 * The sort operation is performed in-place.
 * @returns {Array<number>} The current array instance, with its elements
 *                          sorted from largest to smallest.
 */
Array.prototype.sortNumericalDescending = function () {
  // The comparison function (valB - valA) ensures that elements are ordered
  // from highest to lowest value.
  return this.sort((valA, valB) => (valB - valA));
};

/**
 * Computes a specific split point for a given dimension.
 * This function encapsulates the rounding logic used in the original problem,
 * ensuring consistent application of the `Math.round` method for determining
 * segment lengths.
 * @param {number} totalDimension - The overall length of the dimension to be split.
 * @param {number} divisor - The integer factor by which the dimension is conceptually divided.
 * @returns {number} The calculated length of the initial segment, rounded to the nearest integer.
 */
const computeRoundedSplitPoint = (totalDimension, divisor) => {
  // Direct application of Math.round to maintain original problem's splitting behavior.
  return Math.round(totalDimension / divisor);
};

/**
 * Calculates the difference between the maximum and minimum values within a sorted array of areas.
 * This function is optimized for arrays that are already sorted in descending order,
 * which simplifies the retrieval of the largest and smallest elements.
 * @param {number[]} areaValues - An array expected to contain three numerical area values,
 *                                sorted from largest to smallest.
 * @returns {number} The absolute difference between the largest (first) and smallest (last) area.
 *                   Returns Infinity if the input array is invalid.
 */
const determineMinMaxAreaDifference = (areaValues) => {
  // Basic structural validation for the input array.
  if (!Array.isArray(areaValues) || areaValues.length !== 3) {
    console.error("Runtime Error: Invalid array provided for area difference calculation. Expected 3 sorted numbers.");
    return Infinity; // Indicate an error or an impossible difference.
  }
  // For a descending sorted array [max, mid, min], the difference is simply max - min.
  return areaValues[0] - areaValues[2];
};

/**
 * The primary function responsible for processing input, simulating rectangle splits,
 * and determining the minimum possible difference between the largest and smallest
 * areas of the three resulting pieces.
 * This function handles multiple orientations and subdivision strategies.
 * @param {string[]} rawInputLines - An array of strings where the first element
 *                                   contains two space-separated integers representing
 *                                   the initial rectangle's height and width.
 */
const executeAreaMinimization = (rawInputLines) => {
  // --- Input Processing and Validation (Type III: Enhanced with guard clauses and explicit steps) ---

  // Validate the presence and structure of the input data.
  if (!rawInputLines || rawInputLines.length === 0 || !rawInputLines[0]) {
    console.error("Input Error: No valid input lines provided for processing.");
    return; // Terminate execution gracefully.
  }

  // Parse the initial dimensions from the first line of input.
  const initialDimensionStrings = rawInputLines[0].split(' ');
  const initialParsedDimensions = initialDimensionStrings.map(dimStr => convertStringToInt(dimStr));

  // Extract the height and width, ensuring they are valid numbers.
  let rectangleHeight = initialParsedDimensions[0];
  let rectangleWidth = initialParsedDimensions[1];

  // Further validate that dimensions are positive and numerical.
  if (isNaN(rectangleHeight) || isNaN(rectangleWidth) || rectangleHeight <= 0 || rectangleWidth <= 0) {
    console.error(`Input Error: Invalid rectangle dimensions detected. H=${rectangleHeight}, W=${rectangleWidth}. Both must be positive integers.`);
    return;
  }

  // Initialize a variable to track the smallest area difference found across all configurations.
  let overallMinimumAreaDifference = Infinity;

  // --- Core Splitting Logic (Type III: Enhanced readability with intermediate variables and comments) ---

  // Outer loop: This loop considers two main orientations for the initial rectangle.
  // It effectively swaps the roles of height and width to ensure all initial splitting
  // possibilities are explored for the first cut.
  for (let orientationVariantIndex = 0; orientationVariantIndex < 2; orientationVariantIndex++) {
    // Dynamically assign the current 'width' and 'height' based on the orientation.
    // If orientationVariantIndex is 0, the rectangle is treated as [rectangleWidth, rectangleHeight].
    // If 1, it's treated as [rectangleHeight, rectangleWidth].
    const currentRectangleWorkingDimensions = (orientationVariantIndex === 0)
      ? [rectangleWidth, rectangleHeight]
      : [rectangleHeight, rectangleWidth];

    // Assign more descriptive names to the dimensions for the current iteration.
    const primaryDimensionForFirstSplit = currentRectangleWorkingDimensions[0];
    const secondaryDimensionForFirstSplit = currentRectangleWorkingDimensions[1];

    // Calculate the length of the first piece after the initial cut.
    // The `computeRoundedSplitPoint` helper applies the specific rounding logic.
    const segmentOneLength = computeRoundedSplitPoint(primaryDimensionForFirstSplit, 3);

    // Determine the remaining length of the primary dimension after allocating segment one.
    const remainingLengthForFurtherSplits = primaryDimensionForFirstSplit - segmentOneLength;

    // Calculate the area of the first segment.
    const areaOfFirstPiece = segmentOneLength * secondaryDimensionForFirstSplit;

    // Inner loop: This loop explores two ways to subdivide the *remaining* rectangular area.
    // The remaining area has dimensions `remainingLengthForFurtherSplits` x `secondaryDimensionForFirstSplit`.
    // It can be split either along its `remainingLengthForFurtherSplits` side or its `secondaryDimensionForFirstSplit` side.
    for (let subdivisionStrategyIndex = 0; subdivisionStrategyIndex < 2; subdivisionStrategyIndex++) {
      // Set the dimensions for the secondary split based on the current strategy.
      // If subdivisionStrategyIndex is 0, split along `remainingLengthForFurtherSplits`.
      // If 1, swap dimensions and split along `secondaryDimensionForFirstSplit`.
      const dimensionsForSecondarySplit = (subdivisionStrategyIndex === 0)
        ? [remainingLengthForFurtherSplits, secondaryDimensionForFirstSplit]
        : [secondaryDimensionForFirstSplit, remainingLengthForFurtherSplits];

      // Assign descriptive names for clarity during the secondary split calculation.
      const primaryDimensionForSecondarySplit = dimensionsForSecondarySplit[0];
      const secondaryDimensionForSecondarySplit = dimensionsForSecondarySplit[1];

      // Calculate the length of the second piece from the remaining area.
      const segmentTwoLength = computeRoundedSplitPoint(primaryDimensionForSecondarySplit, 2);

      // The length of the third piece is simply what remains after segment two is taken.
      const segmentThreeLength = primaryDimensionForSecondarySplit - segmentTwoLength;

      // Calculate the areas of the second and third pieces.
      const areaOfSecondPiece = segmentTwoLength * secondaryDimensionForSecondarySplit;
      const areaOfThirdPiece = segmentThreeLength * secondaryDimensionForSecondarySplit;

      // Collect all three areas into an array for sorting and difference calculation.
      let currentSetOfAreas = [areaOfFirstPiece, areaOfSecondPiece, areaOfThirdPiece];

      // Sort the areas in descending order to easily find the maximum and minimum.
      currentSetOfAreas.sortNumericalDescending();

      // Calculate the difference between the largest and smallest areas in this configuration.
      const currentConfigurationAreaDifference = determineMinMaxAreaDifference(currentSetOfAreas);

      // Update the overall minimum difference if the current configuration yields a smaller one.
      overallMinimumAreaDifference = Math.min(overallMinimumAreaDifference, currentConfigurationAreaDifference);
    }
  }

  // --- Output Result (Type II: Renamed, Type III: Added comments) ---

  // Display the smallest area difference found across all explored splitting methods.
  console.log(overallMinimumAreaDifference);
};

// --- Execution Environment Setup (Type III: Robust input reading with error handling) ---

// This block ensures the script can read input from standard input,
// which is typical in competitive programming environments.
try {
  // Read the entire content of standard input as a UTF-8 string.
  // Split the content into an array of lines and trim whitespace from each line.
  const standardInputLines = require("fs").readFileSync("/dev/stdin", "utf8")
    .split('\n')
    .map(singleLine => singleLine.trim());

  // Invoke the main logic with the prepared input data.
  executeAreaMinimization(standardInputLines);
} catch (executionError) {
  // Provide a user-friendly error message if any issues occur during
  // file reading or the execution of the main algorithm.
  console.error(`Fatal Error: An issue occurred during program execution: ${executionError.message}`);
}