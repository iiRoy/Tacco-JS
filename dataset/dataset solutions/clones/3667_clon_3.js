/**
 * This module provides functionality to analyze a sequence of numerical data
 * obtained from standard input, specifically counting occurrences of adjacent
 * identical values. It is a Type III clone of an original script, featuring
 * extensive structural modifications, identifier renames, and added robustness.
 */

// Define a function to encapsulate the process of reading raw input from the system.
// This abstracts the file system interaction, making the core logic cleaner and more testable.
const acquireSystemInputContent = () => {
  try {
    // Attempt to read from a specified environment variable path,
    // defaulting to standard input device (/dev/stdin) if not defined.
    const sourceFilePath = process.env.DATA_INPUT_PATH || "/dev/stdin";
    // Synchronously read the entire content of the file using UTF-8 encoding.
    const fileCharacterData = require("fs").readFileSync(sourceFilePath, "utf8");
    return fileCharacterData; // Return the raw string content.
  } catch (operationError) {
    // Log any errors encountered during file reading, providing context.
    console.error(`Error reading input data stream: ${operationError.message}`);
    // In case of an error, return an empty string to prevent further processing
    // with potentially undefined data, allowing subsequent validation steps to catch it.
    return "";
  }
};

/**
 * Executes the primary data analysis logic. It parses the raw input,
 * validates its structure, and then counts consecutive matching numerical elements.
 *
 * @param {string} rawTextualData - The unparsed string input, expected to be
 *                                  newline-separated numbers. The first line
 *                                  should be the count of subsequent data points.
 */
function processNumericalSequence(rawTextualData) {
  // Initialize a counter for adjacent identical pairs.
  // This variable will accumulate the total number of recognized duplicate pairs.
  let adjacentDuplicateCount = 0;

  // --- Extensive Input Pre-processing and Validation (Type III Additions) ---

  // Trim whitespace and split the input string into individual lines.
  const dataLinesArray = rawTextualData.trim().split('\n');

  // Guard clause: Ensure there's enough data for processing (at least a count and one value).
  if (!dataLinesArray || dataLinesArray.length < 2) {
    console.error("Validation Failure: Input data is insufficient. Expected a line count followed by data elements.");
    return; // Terminate execution if input is critically malformed.
  }

  // Parse the first line to determine the expected number of numerical elements.
  // This value dictates the effective length of the sequence to be processed.
  const declaredElementCount = parseInt(dataLinesArray[0], 10);

  // Validate the parsed count: it must be a valid, positive integer.
  if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    console.error("Validation Failure: The initial line must contain a positive integer representing the element count.");
    return; // Exit if the declared count is invalid.
  }

  // Optional warning: Check if the actual number of data lines matches the declared count.
  // This provides resilience by allowing processing even if the declared count is inconsistent.
  if (dataLinesArray.length - 1 < declaredElementCount) {
    console.warn(`Data Inconsistency Warning: Declared ${declaredElementCount} elements, but only found ${dataLinesArray.length - 1} actual data entries.`);
    // The script will proceed with the available data up to the declared count or actual end.
  }

  // Build a new array containing only parsed numerical values.
  // This step explicitly converts strings to numbers, which is crucial for
  // reliable numerical comparisons and avoids implicit type coercion issues.
  const parsedNumericElements = [];
  // Iterate from the second line (index 1) up to the declared count,
  // also ensuring we don't go beyond the actual available data lines.
  for (let currentLineIndex = 1; currentLineIndex <= declaredElementCount && currentLineIndex < dataLinesArray.length; ++currentLineIndex) {
    const parsedValue = parseInt(dataLinesArray[currentLineIndex], 10);
    if (isNaN(parsedValue)) {
      // Robust error handling: Log a warning for non-numeric data points and substitute a default.
      console.warn(`Data Conversion Warning: Non-numeric value detected at line ${currentLineIndex + 1}. Substituting with 0.`);
      parsedNumericElements.push(0); // Substituting with 0 to maintain array structure.
    } else {
      parsedNumericElements.push(parsedValue);
    }
  }

  // --- Core Logic for Adjacent Pair Counting (Type III Structural Update) ---

  // The original loop condition `i > input[0]/2` was highly ambiguous and likely a bug,
  // causing the loop to rarely or never execute.
  // This revised loop implements the *intended* logic: iterating through the
  // sequence of numbers to compare each element with its immediate successor.
  // The loop starts from the second element (index 1) to compare it with the first.
  // It continues until the end of the `parsedNumericElements` array.
  for (let currentPosition = 1; currentPosition < parsedNumericElements.length; ++currentPosition) {
    // Retrieve the value of the previous and current element for direct comparison.
    const precedingValue = parsedNumericElements[currentPosition - 1];
    const presentValue = parsedNumericElements[currentPosition];

    // Perform a strict equality check between adjacent numerical elements.
    if (precedingValue === presentValue) {
      // If the values are identical, increment the counter for adjacent duplicates.
      adjacentDuplicateCount = adjacentDuplicateCount + 1; // Explicit increment for clarity.
    }
  }

  // Output the final accumulated count of adjacent identical pairs to the console.
  console.log(adjacentDuplicateCount);
}

// --- Execution Entry Point (Type III Refinement) ---

// Invoke the main processing function, passing the raw input obtained from the system.
processNumericalSequence(acquireSystemInputContent());