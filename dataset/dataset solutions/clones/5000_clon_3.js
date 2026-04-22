// Helper function to ensure a binary string has a minimum length by prepending '0's.
// This replaces the original zeroPadding function with a more modern and robust implementation.
const ensureMinLengthBinary = (inputBinaryString, desiredLength) => {
  // Input validation: Check if the inputs are of expected types and values.
  // If desiredLength is invalid, it's impossible to pad meaningfully.
  if (typeof desiredLength !== 'number' || desiredLength < 0 || !Number.isInteger(desiredLength)) {
    console.warn(`Warning: Invalid desired length (${desiredLength}) provided for binary padding. Returning empty string.`);
    return '';
  }
  // If inputBinaryString is not a string, convert it or handle appropriately.
  // For this clone, we'll ensure it's a string, assuming it's meant to be a binary representation.
  const stringToPad = String(inputBinaryString);

  // Use String.prototype.padStart for efficient and concise zero-padding.
  // This replaces the manual loop-based string concatenation from the original.
  return stringToPad.padStart(desiredLength, '0');
};

// Main function to process input data and find subsets with a specific average.
// This function replaces the original 'main' function.
const analyzeSubsetsWithAverage = (rawDataInput) => {
  // Defensive programming: Validate the raw input data.
  if (typeof rawDataInput !== 'string' || rawDataInput.trim() === '') {
    console.error("Error: Input data is empty or not a string. Cannot proceed with analysis.");
    return; // Exit if the primary input is invalid.
  }

  // Split the input into individual lines.
  const allInputLines = rawDataInput.split('\n');

  // Ensure there are enough lines to parse the required parameters.
  if (allInputLines.length < 2) {
    console.error("Error: Insufficient input lines provided. Expected at least two lines.");
    return;
  }

  // Parse the first line containing N (total elements) and A (target average).
  const firstLineData = allInputLines[0].split(' ');
  if (firstLineData.length < 2) {
    console.error("Error: First input line is malformed. Expected two numeric values.");
    return;
  }

  // Parse integers with radix 10 for explicit base.
  const totalElements = parseInt(firstLineData[0], 10); // Renamed N
  const targetAverage = parseInt(firstLineData[1], 10); // Renamed A

  // Validate parsed numeric values from the first line.
  if (isNaN(totalElements) || isNaN(targetAverage)) {
    console.error("Error: Failed to parse numeric values from the first line. Please check input format.");
    return;
  }
  // Add reasonable bounds checks for totalElements (N).
  if (totalElements < 0 || totalElements > 20) { // N is typically small for 2^N operations (e.g., up to 20-30)
      console.warn(`Warning: totalElements (N) is ${totalElements}. This might lead to performance issues or unexpected behavior.`);
      // Decide whether to return or proceed. For this clone, we'll proceed after a warning.
  }

  // Parse the second line containing the array of element values (x).
  const elementValuesStrings = allInputLines[1].split(' ');
  // Convert string values to integers.
  const dataArray = elementValuesStrings.map(val => parseInt(val, 10)); // Renamed x

  // Validate the parsed element values.
  if (dataArray.some(isNaN)) {
    console.error("Error: One or more element values in the second line are not valid numbers.");
    return;
  }
  // Check if the number of provided elements matches 'totalElements'.
  if (dataArray.length < totalElements) {
    console.warn(`Warning: Number of provided element values (${dataArray.length}) is less than totalElements (${totalElements}). Processing with available data.`);
  }

  // Calculate the maximum combination value (2^N).
  // Using bit shift (1 << N) is often more performant than Math.pow(2, N).
  const maxCombinationValue = 1 << totalElements; // Renamed M

  let matchingSubsetCount = 0; // Renamed counter
  // An optional array to store the binary representations of matching subsets,
  // which could be a new fragment (though not used for final output in this clone).
  // const successfulSubsetMasks = [];

  // Iterate through all possible subsets.
  // The loop starts from 1 to exclude the empty set (binary '000...0').
  for (let currentCombinationIndex = 1; currentCombinationIndex < maxCombinationValue; currentCombinationIndex++) {
    // Convert the current index to its binary string representation.
    const rawBinaryString = currentCombinationIndex.toString(2);

    // Pad the binary string with leading zeros to ensure it has 'totalElements' length.
    const subsetSelectionMask = ensureMinLengthBinary(rawBinaryString, totalElements); // Renamed b

    let currentSubsetSum = 0;   // Renamed B
    let activeElementCount = 0; // Renamed n

    // Iterate over the subset mask to calculate the sum of selected elements
    // and the count of active elements. This replaces the regex match for count
    // and the ternary operator for sum, making the logic more explicit.
    for (let bitPosition = 0; bitPosition < totalElements; bitPosition++) { // Renamed j
      // Check if the current bit is '1', indicating the element at 'bitPosition' is included.
      if (subsetSelectionMask[bitPosition] === '1') {
        // Add the corresponding element's value to the current sum.
        currentSubsetSum += dataArray[bitPosition];
        // Increment the count of elements in the current subset.
        activeElementCount++;
      }
    }

    // A guard clause: ensure we don't divide by zero if no elements were selected.
    // (Though 'activeElementCount' will always be >= 1 because 'currentCombinationIndex' starts from 1).
    if (activeElementCount > 0) {
      const calculatedAverage = currentSubsetSum / activeElementCount;

      // Compare the calculated average with the target average.
      // The original problem implies exact integer equality for 'A', so we use strict equality.
      // For floating-point comparisons, an epsilon (e.g., const EPSILON = 1e-9; Math.abs(calculatedAverage - targetAverage) < EPSILON)
      // would typically be used, but not strictly necessary here if A is guaranteed integer.
      if (calculatedAverage === targetAverage) {
        // Log the binary representation of the subset if its average matches.
        console.log(subsetSelectionMask);
        // Increment the counter for matching subsets.
        matchingSubsetCount++;
        // successfulSubsetMasks.push(subsetSelectionMask); // Example of adding new fragment logic
      }
    }
  }

  // After checking all combinations, log the total count of matching subsets.
  console.log(matchingSubsetCount);
  // Example of additional output using a new fragment:
  // if (successfulSubsetMasks.length > 0) {
  //   console.log(`Summary: Found ${successfulSubsetMasks.length} subsets matching the criteria.`);
  // }
};

// Standard boilerplate for reading input from stdin in competitive programming environments.
// This part is kept functionally similar but with added error handling.
const standardInputPath = '/dev/stdin';
try {
  // Read the entire file content synchronously and decode it as UTF-8.
  const fileContent = require('fs').readFileSync(standardInputPath, 'UTF-8');
  // Call the main analysis function with the content.
  analyzeSubsetsWithAverage(fileContent);
} catch (readError) {
  // Log an error if the file cannot be read.
  console.error(`Error: Could not read input from ${standardInputPath}. Details: ${readError.message}`);
  // As a Type III addition, one could provide fallback dummy data here for testing or graceful exit.
  // Example: analyzeSubsetsWithAverage("2 5\n1 9");
}