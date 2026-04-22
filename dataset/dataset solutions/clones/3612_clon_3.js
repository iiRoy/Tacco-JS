// This JavaScript program analyzes a sequence of characters from standard input.
// It aims to identify a specific "anomalous" character based on a defined search boundary.

/**
 * Processes the raw input data to find a specific character based on a set of rules.
 * The function expects the input to be a string containing at least two lines:
 * the first line is the character sequence, and the second line is a numerical limit.
 *
 * @param {string} rawInputPayload - The entire input string, typically read from a file or stdin.
 * @returns {void} This function prints the result directly to the console.
 */
const determineAnomalousCharacter = (rawInputPayload) => {
  // Implementing an initial validation for the integrity of the input payload.
  // If the input is not a string, or is empty after trimming whitespace,
  // it implies a problem with the source data, so we handle it gracefully.
  if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
    console.error("Error: The provided input payload is either empty or not a valid string type.");
    // Following the problem's default output logic for invalid scenarios.
    console.log('1');
    return;
  }

  // Decompose the multi-line input string into an array of individual lines.
  const parsedInputLines = rawInputPayload.split('\n');

  // Verify that we have a sufficient number of lines to extract both the sequence and the limit.
  // At least two lines are essential for the algorithm to proceed as intended.
  if (parsedInputLines.length < 2) {
    console.error("Error: Input contains fewer than the expected two lines (sequence and limit).");
    console.log('1'); // Fallback to default output
    return;
  }

  // Isolate the primary character sequence from the very first line of the input.
  const characterSequence = parsedInputLines[0];

  // Extract and convert the numerical limit from the second line of the input.
  // Using the unary plus operator for type coercion as an alternative to Number() or parseInt().
  let numericalSearchLimit = +parsedInputLines[1];

  // Introduce a robust validation for the search limit.
  // If it's not a number, or is less than one (which would make the search meaningless),
  // we log a warning and assign a default, effective limit.
  if (isNaN(numericalSearchLimit) || numericalSearchLimit < 1) {
    console.warn(`Warning: Invalid or non-positive search limit detected (${parsedInputLines[1]}). Defaulting to 1.`);
    numericalSearchLimit = 1; // A sensible default that allows at least one character to be checked.
  }

  // Initialize variables that will hold the result of our character scan.
  // '1' is the default character to print if no other suitable character is found.
  let finalOutputCharacter = '1';
  let nonOneCharacterLocated = false; // A boolean flag to track if we've found our target.

  // Commence a detailed iteration through the character sequence.
  // The loop terminates either when the end of the sequence is reached,
  // or when the numerical search limit has been hit, whichever occurs first.
  for (let currentPosition = 0; currentPosition < characterSequence.length; currentPosition++) {
    // Check if the current position exceeds the user-defined search boundary.
    // This is an explicit guard within the loop, reinforcing the limit.
    if (currentPosition >= numericalSearchLimit) {
      break; // No need to check further characters beyond the limit.
    }

    const inspectedCharacter = characterSequence[currentPosition];

    // Evaluate if the current character is different from '1'.
    // If it is, this is the "anomalous" character we are looking for.
    if (inspectedCharacter !== '1') {
      finalOutputCharacter = inspectedCharacter; // Store this character as our primary candidate.
      nonOneCharacterLocated = true; // Set the flag to true.
      break; // Since we need the *first* such character, we can exit the loop early.
    }
  }

  // Based on whether an anomalous character was found within the specified constraints,
  // print the determined character to the standard output.
  console.log(finalOutputCharacter);
};

// This block handles the execution environment setup, particularly reading from standard input.
// It's encapsulated in a try-catch to manage potential file system errors gracefully.
try {
  // Require the Node.js file system module for reading input.
  const fsModule = require("fs");
  const standardInputFile = "/dev/stdin"; // Universal path for standard input in Unix-like systems.
  const inputEncoding = "utf8"; // Specify the character encoding for the input stream.

  // Read the entire content from the standard input file synchronously.
  const contentFromStdin = fsModule.readFileSync(standardInputFile, inputEncoding);

  // Invoke our main analysis function with the data obtained from standard input.
  determineAnomalousCharacter(contentFromStdin);
} catch (executionError) {
  // If any error occurs during file reading (e.g., file not found, permissions),
  // log the error message to standard error and provide a default output.
  console.error("A critical error occurred while attempting to read from standard input:", executionError.message);
  console.log('1'); // Ensure a default output even on input reading failure.
}