const fileSystem = require('fs');

/**
 * Utility function to robustly parse a string into an integer.
 * It handles potential whitespace and ensures radix 10 parsing.
 * @param {string} textValue - The string to be converted.
 * @returns {number} The parsed integer, or NaN if the string is not a valid number.
 */
const convertToInteger = (textValue) => parseInt(textValue.trim(), 10);

/**
 * A reusable function to compute the sum of all numerical entries within an array.
 * It provides a safe default for empty or non-array inputs.
 * @param {Array<number>} numbersCollection - An array containing numeric values.
 * @returns {number} The total sum of the elements, or 0 if the collection is empty or invalid.
 */
const calculateArraySum = (numbersCollection) => {
  // Defensive check: ensure the input is an array and not empty.
  if (!Array.isArray(numbersCollection) || numbersCollection.length === 0) {
    return 0;
  }
  // Employ the reduce method for efficient summation.
  return numbersCollection.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
};

// --- Main Program Execution Flow ---
try {
  // Read the entire standard input content as a UTF-8 string.
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

  // Split the raw input into an array of lines, removing any blank lines.
  const processedInputLines = rawInputContent.split('\n').filter(lineEntry => lineEntry.trim() !== '');

  // Validate that enough input lines are present for at least the count and one data point.
  if (processedInputLines.length < 2) {
    console.error("Critical Error: Insufficient input provided. Expected at least a count and subsequent data values.");
    process.exit(1);
  }

  // Extract and parse the first line, which denotes the quantity of primary values.
  const primaryValuesQuantity = convertToInteger(processedInputLines[0]);

  // Perform validation on the parsed quantity.
  if (isNaN(primaryValuesQuantity) || primaryValuesQuantity < 1) {
    console.error("Critical Error: The initial count of elements specified is invalid or missing.");
    process.exit(1);
  }
  // Ensure that the number of data lines matches the declared quantity.
  if (processedInputLines.length < primaryValuesQuantity + 1) {
      console.error(`Critical Error: Expected ${primaryValuesQuantity} data entries, but only ${processedInputLines.length - 1} were found.`);
      process.exit(1);
  }

  // Populate an array with the core input numbers.
  const coreInputNumbers = [];
  for (let dataIndex = 0; dataIndex < primaryValuesQuantity; dataIndex++) {
    const parsedNumber = convertToInteger(processedInputLines[dataIndex + 1]);
    if (isNaN(parsedNumber)) {
      console.error(`Critical Error: Non-numeric data found at input line ${dataIndex + 2}.`);
      process.exit(1);
    }
    coreInputNumbers.push(parsedNumber);
  }

  // Construct a significantly extended array by concatenating the core numbers three times.
  // This pattern is commonly used to simplify logic when dealing with circular arrays or segments that wrap around.
  const tripleExtendedNumbers = coreInputNumbers.concat(coreInputNumbers, coreInputNumbers);

  // Initialize a variable to track the highest sum identified that satisfies the problem's conditions.
  let ultimateMaxSumAchieved = 0; // Distinct name from original 'max'.

  // Guard clause: The outermost loop condition `i < n-2` implies `n` must be at least 4 for `i=1` to run.
  // If `n` is 1, 2, or 3, the loop `for (i=1; i < n-2; i++)` will not execute, and the result will be 0.
  // We explicitly handle this case to match the original behavior and avoid unnecessary computation.
  if (primaryValuesQuantity < 4) {
      console.log(0);
      process.exit(0);
  }

  // Outer loop: Determines the length of the first segment under consideration.
  // 'initialSegmentLength' corresponds to the original 'i'.
  for (let initialSegmentLength = 1; initialSegmentLength < primaryValuesQuantity - 2; initialSegmentLength++) {
    // Middle loop: Iterates through all possible starting positions for the 'initialSegmentLength' segment.
    // 'segmentStartingPoint' corresponds to the original 'j'.
    for (let segmentStartingPoint = 0; segmentStartingPoint < primaryValuesQuantity; segmentStartingPoint++) {

      // Calculate the sum of the current 'initialSegmentLength' segment.
      // This segment is extracted from the 'tripleExtendedNumbers' array.
      let currentEvaluatedSegmentSum = calculateArraySum(
        tripleExtendedNumbers.slice(segmentStartingPoint, segmentStartingPoint + initialSegmentLength)
      ); // Distinct name from original 'temp'.

      // Identify the subsequent portion of the array that needs to be split.
      // This 'remainingWindow' starts immediately after the 'currentEvaluatedSegmentSum' segment
      // and extends for the remainder of 'primaryValuesQuantity' elements.
      const remainingWindowForSplit = tripleExtendedNumbers.slice(
        segmentStartingPoint + initialSegmentLength,
        segmentStartingPoint + primaryValuesQuantity
      ); // Distinct name from original 'arr'.

      // Innermost loop: Determines the split point for 'remainingWindowForSplit'.
      // 'splitDivisionPoint' corresponds to the original 'k'.
      // This loop requires at least two elements in the 'remainingWindowForSplit' to perform a valid split.
      if (remainingWindowForSplit.length < 2) {
          // If the window is too small to be split, skip to the next iteration.
          continue;
      }

      for (let splitDivisionPoint = 1; splitDivisionPoint < remainingWindowForSplit.length; splitDivisionPoint++) {
        // Calculate the sum of the first part of the split window.
        const firstSplitPartitionSum = calculateArraySum(
          remainingWindowForSplit.slice(0, splitDivisionPoint)
        );

        // Calculate the sum of the second part of the split window.
        const secondSplitPartitionSum = calculateArraySum(
          remainingWindowForSplit.slice(splitDivisionPoint) // Slices from 'splitDivisionPoint' to the end.
        );

        // Determine the minimum sum between these two partitions.
        const minimumOfSplitPartitions = Math.min(firstSplitPartitionSum, secondSplitPartitionSum); // Distinct name from original 'min'.

        // If the current evaluated segment's sum is less than or equal to the minimum of the two split partitions,
        // it means this 'currentEvaluatedSegmentSum' is a candidate for the overall maximum.
        if (currentEvaluatedSegmentSum <= minimumOfSplitPartitions) {
          ultimateMaxSumAchieved = Math.max(ultimateMaxSumAchieved, currentEvaluatedSegmentSum);
        }
      }
    }
  }

  // Output the final computed maximum sum to standard output.
  console.log(ultimateMaxSumAchieved);

} catch (runtimeError) {
  // Catch and report any unexpected errors that occur during the program's execution.
  console.error("An unexpected runtime error was encountered:", runtimeError.message);
  process.exit(1); // Exit with a non-zero status code to indicate an error.
}