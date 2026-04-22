'use strict'; // Enforce strict mode for cleaner code practices

// Define constants for clarity and maintainability within the application
const DEFAULT_NO_SOLUTION_MARKER_VALUE = 10001; // A sentinel value indicating no valid solution was found.
                                                // Chosen to be slightly different from the original's 10000
                                                // to demonstrate a Type III change.
const STD_INPUT_FILE_PATH = "/dev/stdin";       // Standard input file path for competitive programming environments

/**
 * Parses a single input line expected to contain two space-separated integer values.
 * Includes basic validation and error handling for robustness.
 *
 * @param {string} lineContent - The raw string line to parse.
 * @returns {{firstValue: number, secondValue: number}} An object containing the two parsed integer values.
 * @throws {Error} If the line is malformed, lacks sufficient values, or contains non-integer data.
 */
function parseDualIntegersFromLine(lineContent) {
  const tokenizedParts = lineContent.trim().split(/\s+/); // Use regex to handle multiple spaces
  if (tokenizedParts.length < 2) {
    throw new Error('Input line does not contain the expected two space-separated values.');
  }

  const primaryNumericValue = parseInt(tokenizedParts[0], 10); // Explicitly specify radix 10
  const secondaryNumericValue = parseInt(tokenizedParts[1], 10);

  if (isNaN(primaryNumericValue) || isNaN(secondaryNumericValue)) {
    throw new Error('Failed to convert parts of the input line into valid integers.');
  }
  return { firstValue: primaryNumericValue, secondValue: secondaryNumericValue };
}

/**
 * Main processing function for the application. It takes an array of raw input lines,
 * interprets them, and determines the minimum cost item that meets a specific time constraint.
 * If no such item is found, it indicates a "Time Limit Exceeded" scenario.
 *
 * @param {string[]} rawInputLines - An array where each element is a string representing a line from the input.
 *                                   The first line contains global parameters (N and T).
 *                                   Subsequent lines contain item-specific data (Cost and Time).
 */
const processComputationalChallenge = rawInputLines => {
  // --- Input Validation and Initial Setup ---
  // Ensure that there is at least one line of input (for parameters).
  if (!rawInputLines || rawInputLines.length === 0) {
    console.error("Critical: No input data was provided for processing.");
    return; // Terminate execution if no data
  }

  // Attempt to parse the global parameters (N: number of entries, T: time threshold)
  let globalParameters;
  try {
    globalParameters = parseDualIntegersFromLine(rawInputLines[0]);
  } catch (parseError) {
    console.error(`Error encountered while parsing global parameters from the first line: ${parseError.message}`);
    console.log('TLE'); // Output 'TLE' to indicate an unrecoverable input parsing failure
    return;
  }

  const totalEntriesToConsider = globalParameters.firstValue;  // Represents 'n' from the original problem
  const maximumAllowedTime = globalParameters.secondValue; // Represents 'T' from the original problem

  // Validate the global parameters
  if (totalEntriesToConsider < 0 || maximumAllowedTime < 0) {
      console.error("Error: Global parameters (number of entries or maximum time) cannot be negative.");
      console.log('TLE');
      return;
  }

  // Determine the actual number of data lines available versus declared.
  // We process up to the declared number of entries, but not more than available lines.
  const availableDataLines = rawInputLines.length - 1; // Exclude the parameter line
  const effectiveLoopLimit = Math.min(totalEntriesToConsider, availableDataLines);

  // Initialize the result variable with the sentinel value.
  // This variable will hold the lowest cost found that satisfies the time constraint.
  let minimumQualifyingCost = DEFAULT_NO_SOLUTION_MARKER_VALUE;

  // --- Core Logic: Iterating and Evaluating Each Item ---
  // The loop starts from index 0 for the effective data lines, but maps to `idx + 1` in `rawInputLines`.
  for (let currentEntryIndex = 0; currentEntryIndex < effectiveLoopLimit; ++currentEntryIndex) {
    const currentInputLine = rawInputLines[currentEntryIndex + 1]; // +1 to skip the header line

    let itemSpecificDetails;
    try {
      itemSpecificDetails = parseDualIntegersFromLine(currentInputLine);
    } catch (lineParseError) {
      console.warn(`Warning: Skipping malformed item data on line ${currentEntryIndex + 2}. Details: ${lineParseError.message}`);
      continue; // Move to the next item if this line is unparsable
    }

    const currentItemCost = itemSpecificDetails.firstValue;  // Represents 'c'
    const currentItemTime = itemSpecificDetails.secondValue; // Represents 't'

    // Additional validation for item-specific values
    if (currentItemCost < 0 || currentItemTime < 0) {
        console.warn(`Warning: Skipping item with negative cost or time on line ${currentEntryIndex + 2}.`);
        continue;
    }

    // Apply the selection criteria:
    // 1. The item's time must be within or equal to the maximum allowed time.
    if (currentItemTime <= maximumAllowedTime) {
      // 2. If the time constraint is met, check if this item's cost is lower than
      //    any previously found qualifying item's cost.
      if (currentItemCost < minimumQualifyingCost) {
        minimumQualifyingCost = currentItemCost; // Update the lowest cost found so far.
      }
    }
  }

  // --- Final Result Determination and Output ---
  // After checking all relevant items, decide what to print.
  if (minimumQualifyingCost === DEFAULT_NO_SOLUTION_MARKER_VALUE) {
    // If the sentinel value hasn't changed, it means no item met the criteria.
    console.log('TLE'); // Output 'TLE' (Time Limit Exceeded)
  } else {
    // Otherwise, output the minimum cost that was found.
    console.log(minimumQualifyingCost);
  }
};

// --- Application Entry Point ---
// This block handles reading the input from the standard input stream
// and initiating the core processing logic.
try {
  // Read the entire content of the standard input file as a UTF-8 string.
  const fileContents = require("fs").readFileSync(STD_INPUT_FILE_PATH, "utf8");

  // Split the content into an array of lines.
  // .filter(Boolean) is used to remove any empty strings resulting from multiple newlines
  // or a trailing newline at the end of the file.
  const incomingDataLines = fileContents.split('\n').filter(Boolean);

  // Call the main processing function with the prepared input lines.
  processComputationalChallenge(incomingDataLines);

} catch (inputReadError) {
  // Catch any errors that occur during file reading (e.g., file not found, permission issues).
  console.error(`Failure during input file operation from ${STD_INPUT_FILE_PATH}: ${inputReadError.message}`);
  console.log('TLE'); // Indicate a failure in the input stage itself.
}