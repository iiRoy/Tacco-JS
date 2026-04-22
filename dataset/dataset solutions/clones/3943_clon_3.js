// Helper function to convert an array of string elements into an array of numbers.
// This function includes a basic check for non-numeric values, issuing a warning if encountered.
const convertArrayElementsToNumbers = (arrOfStringElements) => {
  return arrOfStringElements.map((strElement) => {
    const numericValue = Number(strElement);
    // A simple validation step: if the conversion results in NaN, log a warning.
    if (isNaN(numericValue)) {
      console.warn(`Warning: Non-numeric data "${strElement}" found during conversion.`);
    }
    return numericValue;
  });
};

// Function responsible for fetching the raw input data for the problem.
// It specifically targets standard input typically used in competitive programming environments.
function fetchProblemRawData() {
  // Lazily load the 'fs' module for file system operations.
  const fileSystemModule = require("fs");
  let acquiredContentString; // Variable to hold the content read from input.

  try {
    // Attempt to synchronously read data from the standard input path.
    acquiredContentString = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  } catch (readError) {
    // If reading from /dev/stdin fails (e.g., not running in a typical CP environment),
    // log the error and potentially terminate or provide a fallback.
    console.error("Input data acquisition failed from /dev/stdin:", readError.message);
    // For robustness, in a production setting, one might throw a critical error here.
    throw new Error("Critical: Could not retrieve problem input.");
  }

  // Ensure the content is treated as a string and remove any leading/trailing whitespace.
  const processedContent = String(acquiredContentString).trim();

  // Basic validation: Check if the input is empty after trimming.
  if (processedContent.length === 0) {
    console.warn("Input fetched is empty after whitespace removal. This might indicate an issue.");
  }

  return processedContent;
}

/**
 * A versatile utility for processing and transforming string inputs based on a defined mode.
 * This function consolidates various common input manipulation patterns.
 * @param {string} sourceStringData - The original string data to be processed.
 * @param {number} transformationMode - An integer code specifying the desired data transformation.
 *   - 0: Returns the input string without any changes.
 *   - 1: Parses the string into an integer (base 10).
 *   - 2: Splits the string into an array using a single space (' ') as the delimiter.
 *   - 3: Splits the string into an array using a newline character ('\n') as the delimiter.
 *   - 4: Splits by space, then converts all resulting array elements to numbers.
 *   - 5: Splits by newline, then converts all resulting array elements to numbers.
 *   - 6: Splits the string into an array of individual characters.
 *   - 7: Splits into characters, then converts each character to a number.
 * @returns {any} The transformed data, which can be a string, number, or array.
 */
function dataTransformationService(sourceStringData, transformationMode) {
  // Using an object literal to map transformation modes to specific functions.
  // This provides a cleaner alternative to a traditional switch statement.
  const transformationStrategies = {
    0: (inputStr) => inputStr,
    1: (inputStr) => {
      const parsedInteger = parseInt(inputStr, 10);
      if (isNaN(parsedInteger)) {
        console.error(`Error: Could not parse "${inputStr}" into an integer.`);
      }
      return parsedInteger;
    },
    2: (inputStr) => inputStr.split(" "),
    3: (inputStr) => inputStr.split("\n"),
    4: (inputStr) => convertArrayElementsToNumbers(inputStr.split(" ")),
    5: (inputStr) => convertArrayElementsToNumbers(inputStr.split("\n")),
    6: (inputStr) => inputStr.split(""),
    7: (inputStr) => convertArrayElementsToNumbers(inputStr.split("")),
  };

  const selectedStrategy = transformationStrategies[transformationMode];

  if (selectedStrategy) {
    // Execute the chosen transformation function.
    return selectedStrategy(sourceStringData);
  } else {
    // Handle cases where an unknown or unsupported transformation mode is provided.
    console.error(`Invalid or unsupported transformation mode specified: ${transformationMode}. Returning original data.`);
    return sourceStringData; // Fallback to returning the untransformed string.
  }
}

// The primary function encapsulating the problem's solution logic.
function executeProblemAlgorithm(fullInputContent) {
  // Pre-condition check: Ensure the input content is not null or empty.
  if (!fullInputContent || fullInputContent.length === 0) {
    console.error("Algorithm execution halted: Received empty input content.");
    return; // Terminate execution if no valid input.
  }

  // Step 1: Break down the entire input into an array of individual lines.
  const allInputLinesArray = dataTransformationService(fullInputContent, 3);

  // Validate minimum number of lines expected (N, D X, and at least one item).
  if (allInputLinesArray.length < 2) {
    console.error("Input format error: Expected at least two lines of data (N, D X).");
    return;
  }

  // Step 2: Parse the first line to determine the total number of items (N).
  const numberOfItems = dataTransformationService(allInputLinesArray[0], 1);
  if (isNaN(numberOfItems) || numberOfItems <= 0) {
    console.error(`Invalid value for N (number of items): ${numberOfItems}. Must be a positive integer.`);
    return;
  }

  // Step 3: Parse the second line to get the duration limit (D) and the initial base score (X).
  const durationAndBaseScoreElements = dataTransformationService(allInputLinesArray[1], 2);
  if (durationAndBaseScoreElements.length < 2) {
    console.error("Input format error: Second line must contain two space-separated values for D and X.");
    return;
  }

  const maximumDuration = parseInt(durationAndBaseScoreElements[0], 10);
  const initialContribution = parseInt(durationAndBaseScoreElements[1], 10);

  // Validate parsed D and X values.
  if (isNaN(maximumDuration) || maximumDuration <= 0 || isNaN(initialContribution)) {
    console.error(`Invalid values for D (${maximumDuration}) or X (${initialContribution}).`);
    return;
  }

  let runningTotalScore = 0; // Initialize the counter for the cumulative score.

  // Step 4: Extract and process the remaining lines, which represent item consumption rates.
  // Using slice(2) creates a new array containing lines from the third one onwards.
  const itemRateStrings = allInputLinesArray.slice(2);

  // Optional validation: Check if the actual number of item rates matches the declared N.
  if (itemRateStrings.length !== numberOfItems) {
    console.warn(`Data inconsistency: Declared N is ${numberOfItems}, but found ${itemRateStrings.length} item rates.`);
  }

  const itemConsumptionRates = convertArrayElementsToNumbers(itemRateStrings);

  // Main computation loop: Iterate through each item to calculate its contribution to the score.
  for (let currentItemIdx = 0; currentItemIdx < numberOfItems; currentItemIdx++) {
    const rateOfCurrentItem = itemConsumptionRates[currentItemIdx];

    // Validate the current item's rate.
    if (isNaN(rateOfCurrentItem) || rateOfCurrentItem <= 0) {
      console.warn(`Skipping item at index ${currentItemIdx} due to invalid or non-positive rate: ${rateOfCurrentItem}.`);
      continue; // Move to the next item if the current one's rate is invalid.
    }

    let simulatedDayCount = 1; // Start the simulation for the current item from day 1.

    // Inner loop: Simulate the days an item is consumed until the maximum duration is exceeded.
    while (simulatedDayCount <= maximumDuration) {
      runningTotalScore = runningTotalScore + 1; // Increment score for each consumption event.
      simulatedDayCount = simulatedDayCount + rateOfCurrentItem; // Advance the day counter by the item's rate.
    }
  }

  // Final calculation: Add the initial contribution (X) to the accumulated score.
  const finalComputedResult = runningTotalScore + initialContribution;

  // Output the final computed result to standard output.
  console.log(finalComputedResult);
}

// Entry point for the application: acquire input and then execute the problem solver.
try {
  const problemInputData = fetchProblemRawData();
  executeProblemAlgorithm(problemInputData);
} catch (applicationError) {
  // Catch any unhandled errors that might occur during the overall execution flow.
  console.error("An unexpected application error occurred:", applicationError.message);
  // Optionally, exit the process with an error code.
  // process.exit(1);
}