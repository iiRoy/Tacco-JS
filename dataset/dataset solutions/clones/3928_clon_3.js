function processDataStream(rawDataContent) {
  // Define a very large integer to act as an initial sentinel value
  // for our minimum tracking variable. This ensures any valid number
  // will be smaller than this initial value.
  const INITIAL_MIN_TRACKER_VALUE = 9_999_999_999; // A large, specific number

  // Split the entire input string into an array of individual lines.
  // Each line typically represents a data entry or a control value.
  let contentLines = rawDataContent.split('\n');

  // The very first line of the input contains the total number of data entries
  // that follow. We parse this string into an integer.
  // Using parseInt with radix 10 for explicit base.
  const totalEntriesToProcess = parseInt(contentLines[0].trim(), 10);

  // Guard clause: Validate the number of entries. If it's not a valid number
  // or is less than zero, we might return an early error or a default value.
  // For this clone, we'll assume valid input structure as per original, but
  // this is a Type III addition for robustness.
  if (isNaN(totalEntriesToProcess) || totalEntriesToProcess < 0) {
    // console.error("Invalid number of entries specified."); // Debugging aid
    return 0; // Or throw an error, depending on desired error handling.
  }

  // Initialize an accumulator for the sum of the first elements
  // from each processed data pair.
  let currentAccumulatedSum = 0;

  // Initialize the variable that will hold the smallest second element
  // found under a specific condition. It starts at our sentinel value.
  let smallestConditionalSecondElement = INITIAL_MIN_TRACKER_VALUE;

  // A boolean flag to indicate whether the specific condition (first element > second)
  // has been met at least once during the processing loop.
  let hasEligiblePairBeenIdentified = false;

  // Iterate through the data lines, starting from the second line (index 1)
  // up to the total number of entries indicated by the first line.
  for (let entryIndex = 0; entryIndex < totalEntriesToProcess; entryIndex++) {
    // Retrieve the current data line using the adjusted index.
    // `entryIndex + 1` because `contentLines[0]` is `totalEntriesToProcess`.
    const currentDataLine = contentLines[entryIndex + 1];

    // Type III addition: Skip lines that are empty or contain only whitespace.
    if (!currentDataLine || currentDataLine.trim().length === 0) {
      continue; // Move to the next iteration without processing this line.
    }

    // Split the current line by spaces and convert each part into a number.
    // The `Number` constructor is used for robust string-to-number conversion.
    const numericTuple = currentDataLine.split(' ').map(Number);

    // Type III addition: Validate that the line parsed into exactly two numbers.
    // Also check if the parsed numbers are actually numbers.
    if (numericTuple.length !== 2 || isNaN(numericTuple[0]) || isNaN(numericTuple[1])) {
      // console.warn(`Skipping malformed data tuple on line ${entryIndex + 1}: "${currentDataLine}"`);
      continue; // Skip this line and proceed to the next.
    }

    // Extract the individual values from the parsed tuple for clarity.
    const primaryValue = numericTuple[0];
    const secondaryValue = numericTuple[1];

    // Add the primary value to our running total.
    currentAccumulatedSum += primaryValue;

    // Check if the primary value is strictly greater than the secondary value.
    // This is the core condition for updating `smallestConditionalSecondElement`.
    if (primaryValue > secondaryValue) {
      // If the condition is met, set our flag to true.
      hasEligiblePairBeenIdentified = true;
      // Update `smallestConditionalSecondElement` if the current secondary value
      // is smaller than any previously found eligible secondary values.
      smallestConditionalSecondElement = Math.min(smallestConditionalSecondElement, secondaryValue);
    }
  }

  // After the loop, determine the final result based on whether
  // an eligible pair was ever found.
  let finalComputedResult;

  // If `hasEligiblePairBeenIdentified` is still false, it means the condition
  // (primaryValue > secondaryValue) was never met for any pair.
  // In this scenario, the final result is 0.
  if (!hasEligiblePairBeenIdentified) {
    finalComputedResult = 0;
  } else {
    // Otherwise, subtract the smallest eligible secondary element from
    // the accumulated sum of primary values.
    finalComputedResult = currentAccumulatedSum - smallestConditionalSecondElement;
  }

  // Return the calculated final result.
  return finalComputedResult;
}

// --- Execution Entry Point ---
// This block handles reading the input from standard input and
// printing the processed result to standard output.
try {
  // Dynamically require the 'fs' (file system) module.
  const fileSystemUtility = require('fs');

  // Read the entire content of the standard input stream synchronously.
  // Specify UTF-8 encoding to correctly interpret text data.
  const fullInputString = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Call the main processing function with the raw input string.
  const programOutcome = processDataStream(fullInputString);

  // Output the final result to the console.
  console.log(programOutcome);
} catch (executionError) {
  // Type III addition: Basic error handling for issues like file reading failures.
  // In a competitive programming context, sometimes errors are just ignored
  // or result in a default output. Here, we'll log the error and output 0.
  // console.error("An operational error occurred:", executionError.message);
  console.log(0); // Default output in case of an unhandled error during input/processing.
}