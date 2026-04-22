'use strict';

// Function to compute the greatest common divisor between two numbers.
// This version uses an iterative approach based on the Euclidean algorithm.
const computeDivisorValue = (firstOperand, secondOperand) => {
  // Ensure inputs are treated as absolute numbers, as GCD is typically non-negative.
  let currentA = Math.abs(Number(firstOperand));
  let currentB = Math.abs(Number(secondOperand));

  // Handle cases where inputs might be invalid or zero.
  // If both are zero, the GCD is often considered undefined or 0.
  // If one is zero, the other is the GCD.
  if (isNaN(currentA) || isNaN(currentB)) {
    return 0; // Return 0 for non-numeric inputs for consistency.
  }
  if (currentA === 0) {
    return currentB;
  }
  if (currentB === 0) {
    return currentA;
  }

  // Iterate using the Euclidean algorithm until the remainder is zero.
  while (currentB !== 0) {
    const remainderTemporary = currentA % currentB;
    currentA = currentB;
    currentB = remainderTemporary;
  }
  return currentA;
};

// Utility function to convert a string input into a number.
// Includes a basic check for non-numeric conversion.
const parseStringAsNumeric = (textualInput) => {
  const numericOutcome = Number(textualInput);
  // If the conversion results in NaN, return 0 to prevent issues later.
  return isNaN(numericOutcome) ? 0 : numericOutcome;
};

// Main function responsible for processing the input data and calculating the result.
const executeDataAnalysis = (inputDataLines) => {
  // Initial validation for the structure of the input array.
  if (!Array.isArray(inputDataLines) || inputDataLines.length < 2) {
    console.error("Error: Input data is incomplete or malformed.");
    return;
  }

  // The first line contains the total expected number of elements.
  const totalItemCount = parseStringAsNumeric(inputDataLines[0]);

  // If the count is zero or less, or invalid, the result is 0.
  if (totalItemCount <= 0) {
    console.log(0);
    return;
  }

  // The second line contains space-separated numbers.
  // Split by one or more whitespace characters and parse each into a number.
  const numericalSequence = inputDataLines[1].split(/\s+/).map(parseStringAsNumeric);

  // A variable to store the highest GCD found across all iterations.
  let maximumOverallGCD = 0;

  // Outer loop: Each iteration considers one element from the sequence to be 'excluded'.
  for (let excludedElementIndex = 0; excludedElementIndex < totalItemCount; excludedElementIndex++) {
    // This variable will accumulate the GCD for the current subset (all elements except the excluded one).
    let currentSubsetGCD = 0;
    // Flag to correctly initialize currentSubsetGCD with the first relevant number.
    let isFirstNonExcludedFound = false;

    // Inner loop: Iterates through all numbers to compute the GCD of the current subset.
    for (let currentElementScanIndex = 0; currentElementScanIndex < totalItemCount; currentElementScanIndex++) {
      // Skip the element that is currently designated as 'excluded'.
      if (excludedElementIndex !== currentElementScanIndex) {
        const valueToProcess = numericalSequence[currentElementScanIndex];

        if (!isFirstNonExcludedFound) {
          // For the very first element encountered in the subset, simply assign its value.
          currentSubsetGCD = valueToProcess;
          isFirstNonExcludedFound = true;
        } else {
          // For subsequent elements, compute GCD with the accumulated value.
          currentSubsetGCD = computeDivisorValue(currentSubsetGCD, valueToProcess);
        }
      }
    }

    // After processing all elements for the current exclusion,
    // update the overall maximum if this subset's GCD is higher.
    if (currentSubsetGCD > maximumOverallGCD) {
      maximumOverallGCD = currentSubsetGCD;
    }
  }

  // Display the final maximum GCD found.
  console.log(maximumOverallGCD);
};

// Entry point for script execution.
// It reads input from standard input, processes it, and handles potential errors.
try {
  const nodeFileSystemModule = require("node:fs");
  const standardInputFilePath = "/dev/stdin"; // Standard input path for POSIX systems.

  // Read the entire content of stdin as a UTF-8 string.
  const rawDataContent = nodeFileSystemModule.readFileSync(standardInputFilePath, "utf8");
  // Clean up whitespace and split the content into an array of lines.
  const processedInputLinesArray = rawDataContent.trim().split('\n');

  // Invoke the main data analysis function with the prepared input.
  executeDataAnalysis(processedInputLinesArray);
} catch (processingError) {
  // If any error occurs during file reading or initial processing, log it.
  console.error("An operational error occurred during input acquisition:", processingError.message);
  // In case of an error, output 0 as a default, common behavior in competitive programming.
  console.log(0);
}