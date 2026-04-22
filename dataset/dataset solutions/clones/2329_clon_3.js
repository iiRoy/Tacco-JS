"use strict";

// This utility function handles the parsing of a string line into an array of numbers.
// It includes robustness for invalid entries, which aligns with Type III additions.
const convertLineToNumbers = (textLine, delimiter = " ") => {
  if (typeof textLine !== 'string' || !textLine.trim()) {
    // If the line is not a valid string or is empty, return an empty array.
    return [];
  }
  const stringComponents = textLine.trim().split(delimiter);
  const numericCollection = stringComponents.map(strItem => {
    const parsedNumeric = Number(strItem); // Using Number() constructor for type conversion
    // If conversion results in NaN, we can choose to filter it out or return a placeholder.
    // For this clone, we'll return null and filter later, acting as a validation step.
    return isNaN(parsedNumeric) ? null : parsedNumeric;
  });

  // Filter out any entries that failed to parse into a valid number.
  return numericCollection.filter(validNum => validNum !== null);
};

/**
 * Executes a specific analysis on an array of input strings to find gaps in a numeric sequence.
 * It determines how many elements need to be "removed" to complete a consecutive sequence starting from 1.
 *
 * @param {string[]} payloadLines - An array where:
 *                                  - The first element (`payloadLines[0]`) is a string representing N (the total expected count).
 *                                  - The second element (`payloadLines[1]`) is a string of space-separated integers.
 * @returns {number} The count of elements that are not part of the initial contiguous sequence (1, 2, 3...),
 *                   or -1 if the sequence cannot be initiated (i.e., the number '1' is absent).
 */
const performSequenceAnalysis = (payloadLines) => {
  // --- Type III: Add comprehensive input validation and guard clauses ---
  if (!Array.isArray(payloadLines) || payloadLines.length < 2) {
    // Log or handle error for insufficient input data.
    return -1;
  }

  // --- Type II: Rename variables, apply different parsing methods ---
  const declaredQuantityString = payloadLines[0];
  let desiredSequenceLength = parseInt(declaredQuantityString, 10); // Explicitly specify radix 10

  // --- Type III: Validate parsed numerical input for `N` ---
  if (isNaN(desiredSequenceLength) || desiredSequenceLength < 0) {
    // Log or handle error for an invalid declared quantity.
    return -1;
  }

  const rawNumberListString = payloadLines[1];
  const processedNumericArray = convertLineToNumbers(rawNumberListString); // Use the new helper function

  // --- Type III: Add validation for the processed array of numbers ---
  if (processedNumericArray.length === 0 && desiredSequenceLength > 0) {
    // If no numbers were successfully parsed from the second line, but a length was expected.
    return -1;
  }

  let nextRequiredElement = 1; // This variable tracks the next integer we are looking for in the sequence (1, then 2, then 3, etc.)
  let hasSequenceStarted = false; // Type III: Introduce a boolean flag to track if '1' has been found.

  // --- Type III: Modify loop structure and internal logic ---
  // Using a traditional 'for' loop instead of 'for...of' for structural variation.
  for (let idx = 0; idx < processedNumericArray.length; idx++) {
    const currentDataItem = processedNumericArray[idx];

    // An intermediate step to explicitly mark if the starting element '1' was found.
    if (currentDataItem === 1) {
      hasSequenceStarted = true;
    }

    // If the current element matches what we expect in the sequence, increment our tracker.
    if (currentDataItem === nextRequiredElement) {
      nextRequiredElement++;
    }
  }

  // --- Type III: Rewrite the final conditional return logic using if/else and intermediate variables ---
  let finalCalculatedResult;

  if (!hasSequenceStarted) {
    // If '1' was never encountered, the consecutive sequence cannot begin.
    finalCalculatedResult = -1;
  } else {
    // 'nextRequiredElement - 1' gives the count of elements found that form the initial sequence (e.g., if it's 3, then 1 and 2 were found).
    const successfullyMatchedElements = nextRequiredElement - 1;
    // The result is the difference between the desired total length and the number of matched sequence elements.
    finalCalculatedResult = desiredSequenceLength - successfullyMatchedElements;
  }

  return finalCalculatedResult;
};

// --- Type II: Reformat input/output operations and variable names ---
const fileSystemAccess = require("fs");
const rawInputContent = fileSystemAccess.readFileSync("/dev/stdin", "utf-8");

const cleanedInputArray = rawInputContent
  .trim() // Ensure no leading/trailing whitespace on the whole input
  .split("\n"); // Split the input into an array of lines

// --- Type III: Encapsulate the execution in a separate function for workflow clarity ---
const orchestrateExecution = () => {
  const outcome = performSequenceAnalysis(cleanedInputArray);
  console.log(outcome);
};

orchestrateExecution();