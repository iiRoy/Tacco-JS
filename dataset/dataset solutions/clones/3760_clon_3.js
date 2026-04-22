// This function processes raw input data to find the maximum possible aggregate sum
// based on various combinations of positive/negative values from input coordinates.
function processInputData(rawInputString) {
  // Split the entire input string into individual lines.
  const inputLines = rawInputString.split('\n');

  // Validate that there's at least one non-empty line of input.
  if (inputLines.length === 0 || inputLines[0].trim() === '') {
    console.error("Error: Input string is empty or contains no meaningful data.");
    return; // Exit if input is invalid
  }

  // Parse the first line to extract the total number of data points and
  // the count of top elements to consider for summation.
  // Using destructuring and map(Number) for concise parsing.
  const [dataPointsTotal, topElementsToSum] = inputLines[0].split(' ').map(Number);

  // Perform basic validation on the parsed numerical parameters.
  if (isNaN(dataPointsTotal) || isNaN(topElementsToSum) || dataPointsTotal < 0 || topElementsToSum < 0) {
    console.error("Error: Invalid numerical parameters for total data points or elements to select.");
    return;
  }

  // Define eight distinct arrays to store the calculated scores for each combination
  // of positive/negative signs for x, y, and z coordinates.
  // These arrays will accumulate scores for all data points.
  const allPositiveScores = [];      // x + y + z
  const xY_minusZ_Scores = [];     // x + y - z
  const x_minusY_plusZ_Scores = []; // x - y + z
  const x_minusY_minusZ_Scores = [];// x - y - z
  const minusX_plusY_plusZ_Scores = [];// -x + y + z
  const minusX_plusY_minusZ_Scores = [];// -x + y - z
  const minusX_minusY_plusZ_Scores = [];// -x - y + z
  const allNegativeScores = [];    // -x - y - z

  // Iterate through the input lines, starting from the second line (index 1),
  // as each line from here on represents a set of coordinates for one data point.
  for (let currentDataPointIndex = 0; currentDataPointIndex < dataPointsTotal; currentDataPointIndex++) {
    // Fetch the current line, split it by space, and convert the resulting parts to numbers.
    const currentCoordinateParts = inputLines[currentDataPointIndex + 1].split(' ').map(Number);

    // Validate that each line contains exactly three numeric parts (x, y, z).
    if (currentCoordinateParts.length !== 3 || currentCoordinateParts.some(isNaN)) {
      console.warn(`Warning: Skipping invalid coordinate data on input line ${currentDataPointIndex + 2}. Expected 3 numbers.`);
      continue; // Skip this malformed line and proceed to the next one
    }

    // Destructure the coordinate parts into named variables for enhanced readability.
    const [xValue, yValue, zValue] = currentCoordinateParts;

    // Populate each of the eight score arrays with the computed sum/difference
    // for the current data point's coordinates.
    allPositiveScores.push(xValue + yValue + zValue);
    xY_minusZ_Scores.push(xValue + yValue - zValue);
    x_minusY_plusZ_Scores.push(xValue - yValue + zValue);
    x_minusY_minusZ_Scores.push(xValue - yValue - zValue);
    minusX_plusY_plusZ_Scores.push(-xValue + yValue + zValue);
    minusX_plusY_minusZ_Scores.push(-xValue + yValue - zValue);
    minusX_minusY_plusZ_Scores.push(-xValue - yValue + zValue);
    allNegativeScores.push(-xValue - yValue - zValue);
  }

  // Consolidate all the individual score lists into a single array for streamlined processing.
  const collectionOfScoreLists = [
    allPositiveScores,
    xY_minusZ_Scores,
    x_minusY_plusZ_Scores,
    x_minusY_minusZ_Scores,
    minusX_plusY_plusZ_Scores,
    minusX_plusY_minusZ_Scores,
    minusX_minusY_plusZ_Scores,
    allNegativeScores,
  ];

  // Apply the helper function to each score list to compute the sum of its top 'N' elements.
  // The 'map' method elegantly transforms each list into its corresponding maximum aggregate sum.
  const calculatedMaxAggregateSums = collectionOfScoreLists.map(list =>
    sumTopNValues(list, topElementsToSum)
  );

  // Determine the single highest sum among all the calculated maximum aggregate sums.
  // Sorting in ascending order and then popping the last element efficiently finds the maximum.
  const finalOverallMaximumSum = calculatedMaxAggregateSums.sort((valA, valB) => valA - valB).pop();

  // Output the ultimate result to the console.
  console.log(finalOverallMaximumSum);
}

/**
 * Helper utility function to sort an array of numbers in descending order,
 * then sum up the specified number of top elements.
 *
 * @param {number[]} numericValues - The array of numerical values to process.
 * @param {number} nElementsToSum - The quantity of top values to include in the sum.
 * @returns {number} The cumulative sum of the top 'n' elements, or 0 if inputs are invalid or empty.
 */
function sumTopNValues(numericValues, nElementsToSum) {
  // Implement robust guard clauses for edge cases and invalid inputs.
  if (!Array.isArray(numericValues) || numericValues.length === 0 || nElementsToSum <= 0) {
    return 0; // Return 0 for empty, invalid, or non-positive 'n' arrays.
  }

  // Create a shallow copy of the array to ensure the original is not modified,
  // then sort it in descending order (largest values first).
  const sortedValuesDescending = [...numericValues].sort((valA, valB) => valB - valA);

  let runningSum = 0; // Initialize a variable to accumulate the sum.
  // Iterate only up to 'nElementsToSum' or the actual length of the sorted array,
  // whichever limit is reached first, to prevent out-of-bounds access.
  for (let k = 0; k < Math.min(nElementsToSum, sortedValuesDescending.length); k++) {
    runningSum += sortedValuesDescending[k]; // Add the current top value to the running total.
  }

  return runningSum; // Return the final accumulated sum.
}

// Main execution block: Reads input from standard input and initiates processing.
// This setup is typical for competitive programming environments using Node.js.
try {
  const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(fileInputContent);
} catch (readError) {
  // Catch and report any errors encountered during file reading.
  console.error("An error occurred while attempting to read input from /dev/stdin:", readError.message);
  // Additional logging for debugging might be useful here, e.g., console.error(readError.stack);
}