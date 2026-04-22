"use strict"; // Enforces stricter parsing and error handling in JavaScript.

/**
 * Orchestrates the processing of raw input data to identify specific numeric patterns.
 * This function is designed to mimic a solution for a common competitive programming problem,
 * focusing on robustness and clarity through extensive modifications.
 *
 * @param {string} incomingTextContent - The raw string input, typically read from stdin.
 */
const executeSolution = (incomingTextContent) => {
  // --- Stage 1: Input Validation and Sanitization (Extensive Type III additions) ---

  // Guard clause: Check for null or empty input content at the earliest point.
  if (incomingTextContent === null || incomingTextContent.length === 0) {
    console.error("Error: Input content is null or empty. Cannot proceed.");
    // In a real application, one might throw an exception instead of exiting.
    process.exit(1);
  }

  // Remove any leading or trailing whitespace from the entire input string.
  const sanitizedContentBlock = incomingTextContent.trim();

  // Guard clause: After trimming, the content might become empty.
  if (sanitizedContentBlock.length === 0) {
    console.error("Error: Input content became entirely whitespace after trimming. Cannot parse.");
    process.exit(1);
  }

  // Split the clean content block into an array of individual lines.
  const parsedContentLines = sanitizedContentBlock.split('\n');

  // Guard clause: Ensure we have at least two lines of input as expected by the problem structure.
  if (parsedContentLines.length < 2) {
    console.error(`Error: Insufficient input lines. Expected at least 2, received ${parsedContentLines.length}.`);
    process.exit(1);
  }

  // --- Stage 2: Parsing Configuration (First Line - N) (Type III: Usage for validation) ---

  // The first line is expected to contain 'N', the total count of elements in the subsequent data array.
  const firstLineSegment = parsedContentLines[0].trim();
  const firstLineTokens = firstLineSegment.split(' ');

  // Guard clause: Ensure the first line is not empty or malformed.
  if (firstLineTokens.length === 0 || firstLineTokens[0].length === 0) {
      console.error("Error: First line is empty or contains no discernible tokens.");
      process.exit(1);
  }

  // Convert the first token to a number, which represents the expected length of the data array.
  const declaredArraySize = Number(firstLineTokens[0]);

  // Validation: Check if 'N' is a valid non-negative integer.
  if (isNaN(declaredArraySize) || !Number.isInteger(declaredArraySize) || declaredArraySize < 0) {
    console.error(`Error: Invalid value '${firstLineTokens[0]}' for declared array size (N). Must be a non-negative integer.`);
    process.exit(1);
  }

  // --- Stage 3: Parsing Data Array (Second Line - A) (Type III: Detailed parsing with checks) ---

  // The second line contains the space-separated numeric elements of the primary data sequence.
  const dataElementsString = parsedContentLines[1].trim();
  const rawNumericStrings = dataElementsString.split(' ');

  // Initialize an array to hold the parsed numeric values.
  const primaryNumericSequence = []; // Renamed from 'A'

  // Iterate over each raw string to parse it into a number, with robust error handling.
  for (const itemString of rawNumericStrings) {
    // Skip empty strings that might result from multiple spaces.
    if (itemString === '') {
        continue;
    }
    const parsedValue = Number(itemString); // Using Number() which handles various number formats.

    // Validation: Check if the parsed value is indeed a number.
    if (isNaN(parsedValue)) {
      console.warn(`Warning: Non-numeric value '${itemString}' encountered in data sequence. This element will be skipped.`);
      continue; // Skip the invalid element and proceed with others.
    }
    primaryNumericSequence.push(parsedValue);
  }

  // Validation: Cross-check the actual number of parsed elements against the declared size (N).
  if (primaryNumericSequence.length !== declaredArraySize) {
    console.warn(`Warning: Actual parsed array length (${primaryNumericSequence.length}) does not match declared size (N=${declaredArraySize}). Proceeding with available data.`);
  }

  // --- Stage 4: Core Logic Calculation (Type III: Rewritten loop, explicit conditions, helper variables) ---

  // Initialize a counter to accumulate the final result. Renamed from 'ans'.
  let oddValueAtOddPositionCount = 0;

  // Iterate through the numeric sequence using a standard 0-based index.
  // The problem's original logic targeted 1-based odd positions (e.g., 2nd, 4th, 6th elements).
  // In a 0-indexed array, these correspond to indices 1, 3, 5, etc.
  for (let currentPositionIndex = 0; currentPositionIndex < primaryNumericSequence.length; ++currentPositionIndex) {
    // Determine if the current 0-based index corresponds to an odd 1-based position.
    // (e.g., index 1 is the 2nd element, index 3 is the 4th element, etc.)
    const isCurrentIndexAnOddZeroBasedPosition = (currentPositionIndex % 2 !== 0);

    // Only proceed if the index itself is odd (i.e., it's the 2nd, 4th, etc. element).
    if (isCurrentIndexAnOddZeroBasedPosition) {
      const valueAtCurrentIndex = primaryNumericSequence[currentPositionIndex];

      // Determine if the numeric value at this odd index is itself an odd number.
      // Using modulo 2 and checking for non-zero remainder covers both positive and negative odd numbers.
      const isValueItselfOdd = (valueAtCurrentIndex % 2 !== 0);

      // If both conditions are met (odd 0-based index AND odd value), increment the counter.
      if (isValueItselfOdd) {
        oddValueAtOddPositionCount++;
      }
    }
  }

  // --- Stage 5: Output Result (Type II: Renamed variable in output) ---

  // Display the final calculated count to standard output.
  console.log(oddValueAtOddPositionCount);
};

// --- Execution Entry Point (Type II: Renamed function call, minor module change) ---

// This block ensures the solution is executed when the script runs directly.
// It reads all content from standard input ('/dev/stdin') using Node.js's file system module,
// interpreting it as UTF-8 encoded text, and then passes it to the main processing function.
executeSolution(require('node:fs').readFileSync('/dev/stdin', 'utf8'));