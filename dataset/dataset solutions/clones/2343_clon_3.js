"use strict";

// This module encapsulates the core logic for a simple card game outcome determination.
// It processes a string of numerical inputs to decide if a player has "busted" or "won".

/**
 * Defines the maximum allowable score before a player "busts".
 * This constant makes the threshold value easily configurable.
 * @type {number}
 */
const GAME_BUST_THRESHOLD = 21; // Renamed constant, added JSDoc comment

/**
 * Processes a raw input string, parses numerical values,
 * calculates their sum, and determines a game outcome based on a predefined threshold.
 *
 * @param {string} incomingInputData - The raw string data, expected to contain space-separated numbers.
 * @returns {void} - This function prints the result directly to the console.
 */
const evaluateGameRoundOutcome = (incomingInputData) => { // Renamed function, parameter
  // Step 1: Input Validation and Initial Processing
  // Check if the provided input is valid for processing.
  if (typeof incomingInputData !== 'string' || incomingInputData.trim().length === 0) { // Enhanced input validation
    console.error("Error: Received an invalid or empty data string for evaluation. Please provide numerical inputs.");
    return; // Exit early on invalid input
  }

  // Break down the input string into an array of potential number strings.
  // Using a more explicit split operation.
  const partsOfInput = incomingInputData.split(' '); // Renamed variable, slightly different phrasing

  // Ensure there are enough parts to perform the core calculation.
  const MINIMUM_REQUIRED_PARTS = 3; // New helper constant
  if (partsOfInput.length < MINIMUM_REQUIRED_PARTS) { // Guard clause for array length
    console.warn(`Warning: Insufficient numerical components provided. Expected at least ${MINIMUM_REQUIRED_PARTS}, but received ${partsOfInput.length}.`);
    // For this scenario, we might still want to proceed with available, or exit.
    // Original only sums first three, so if less than 3, it's an implicit error.
    console.log("Cannot determine game outcome with fewer than three scores."); // Custom message
    return;
  }

  // Step 2: Numerical Conversion and Aggregation
  const collectedValidScores = []; // Renamed array for storing parsed numbers
  // Loop through the initial components (up to the minimum required) to parse them.
  for (let i = 0; i < MINIMUM_REQUIRED_PARTS; i++) { // Explicit loop for parsing
    const currentStringPart = partsOfInput[i]; // Intermediate variable
    // Attempt to convert the string part into an integer.
    // Using unary plus operator for type conversion, which is another common JS idiom.
    const convertedNumericValue = +currentStringPart; // Different parsing method (+ operator)

    // Validate if the conversion was successful.
    if (Number.isNaN(convertedNumericValue)) { // Check for NaN
      console.error(`Parsing Error: Component "${currentStringPart}" could not be converted to a valid number. Aborting evaluation.`);
      return; // Exit if any part is not a number
    }
    collectedValidScores.push(convertedNumericValue); // Store valid score
  }

  // Calculate the total score from the collected numbers.
  // Using a different aggregation method (forEach loop instead of reduce or direct sum).
  let totalCalculatedScore = 0; // Renamed sum variable
  collectedValidScores.forEach(singleScore => { // ForEach loop for summation
    totalCalculatedScore += singleScore;
  });

  // Step 3: Outcome Determination and Reporting
  let finalGameStatusMessage; // Variable to hold the result string

  // Compare the total score against the predefined bust threshold.
  // Inverted the condition logic for a different flow.
  if (totalCalculatedScore <= GAME_BUST_THRESHOLD) { // Inverted condition
    finalGameStatusMessage = "win"; // Assign win message
  } else {
    finalGameStatusMessage = "bust"; // Assign bust message
  }

  // Output the determined game status to the standard output.
  console.log(finalGameStatusMessage); // Print the result
  // The function implicitly returns undefined, no explicit return statement is necessary.
};

// --- Execution Entry Point ---
// This section handles reading input from the environment and invoking the main logic.

// Import the Node.js file system module.
const fileSystemHandler = require('fs'); // Renamed module import variable

// Define the standard input stream path.
const STANDARD_INPUT_SOURCE = '/dev/stdin'; // Renamed path constant

// Read the entire content of the standard input stream as a UTF-8 string.
const rawInputBuffer = fileSystemHandler.readFileSync(STANDARD_INPUT_SOURCE, 'utf8'); // Renamed buffer variable

// Call the main game evaluation function with the obtained input data.
evaluateGameRoundOutcome(rawInputBuffer); // Call the renamed function

// End of file.