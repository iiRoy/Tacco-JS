// This module serves to analyze a set of numerical inputs,
// specifically designed to compute the span or range of values.
// It handles input parsing, data validation, numeric sorting,
// and robust error management for standard input operations.

/**
 * Processes raw string content to determine the numeric range (max - min)
 * of a list of integers provided on the second line of the input.
 *
 * @param {string} rawContent - The entire input string, typically read from stdin.
 */
function processInputData(rawContent) {

  // Define essential constants for string manipulation and data parsing.
  const LINE_BREAK_CHAR = "\n";
  const DATA_FIELD_DELIMITER = " ";
  const INTEGER_PARSE_BASE = 10; // Specifies base-10 for parseInt operations.

  // Step 1: Normalize and segment the incoming raw data into distinct lines.
  // Trimming removes any leading/trailing whitespace, including unwanted newlines.
  const inputSegments = rawContent.trim().split(LINE_BREAK_CHAR);

  // Validation 1: Ensure the input contains at least two lines.
  // The first line (original N) is technically ignored in this refined version,
  // but two lines are expected for the structure.
  if (inputSegments.length < 2) {
    console.error("Fatal Error: Input stream lacks sufficient data lines. Expected at least two lines.");
    return; // Terminate execution due to critical input format issue.
  }

  // Step 2: Isolate the line containing the actual numeric data.
  // This is consistently the second line of the input.
  const numberSequenceString = inputSegments[1];

  // Step 3: Break down the string of numbers into an array of string tokens.
  const stringTokens = numberSequenceString.split(DATA_FIELD_DELIMITER);

  // Validation 2: Check for an empty or effectively empty list of numbers.
  // If no numbers are provided, the range is conventionally zero.
  if (stringTokens.length === 0 || (stringTokens.length === 1 && stringTokens[0].trim() === '')) {
    console.warn("Notice: No numeric data detected for range calculation. Outputting 0 as default range.");
    console.log(0);
    return;
  }

  // Step 4: Convert each string token into an integer.
  // Uses `map` for transformation and `parseInt` with explicit radix for safety.
  const convertedNumbers = stringTokens.map(token => parseInt(token, INTEGER_PARSE_BASE));

  // Validation 3: Verify that all converted values are valid numbers.
  // `isNaN` check helps identify non-numeric entries in the input.
  if (convertedNumbers.some(Number.isNaN)) {
    console.error("Data Error: Found non-numeric entries in the provided list of values. Cannot compute range.");
    return;
  }

  // Validation 4: Handle the edge case of a single numeric value.
  // The range of a single number is always zero.
  if (convertedNumbers.length === 1) {
    console.log(0);
    return;
  }

  // Step 5: Sort the array of numbers numerically in ascending order.
  // A custom comparison function (a - b) is crucial for correct numeric sorting,
  // as default `sort()` would treat numbers as strings.
  const numericallyOrderedValues = convertedNumbers.sort((valA, valB) => valA - valB);

  // Step 6: Extract the extreme values from the now sorted list.
  // The first element is the minimum, and the last is the maximum.
  const lowestObservedValue = numericallyOrderedValues[0];
  const highestObservedValue = numericallyOrderedValues[numericallyOrderedValues.length - 1];

  // Step 7: Calculate the final range by subtracting the minimum from the maximum.
  const calculatedValueSpan = highestObservedValue - lowestObservedValue;

  // Step 8: Output the computed range to standard output.
  console.log(calculatedValueSpan);
}

// Encapsulated execution block using an Immediately Invoked Function Expression (IIFE).
// This structure helps manage scope and ensures immediate execution upon script load.
(function() {
  const fileSystemModule = require('fs'); // Standard Node.js module for file system operations.
  const standardInputPath = '/dev/stdin'; // Universal path for standard input on Unix-like systems.
  const defaultEncoding = 'utf8'; // Character encoding for reading the input file.

  try {
    // Read the entire content of the standard input file synchronously.
    const rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, defaultEncoding);

    // Invoke the primary processing function with the obtained input data.
    processInputData(rawInputBuffer);

  } catch (ioOperationError) {
    // Catch and report any exceptions that occur during file reading or initial setup.
    console.error("System I/O Error: An issue occurred while accessing standard input.", ioOperationError.message);
    // Provide additional context for common errors like file not found.
    if (ioOperationError.code === 'ENOENT') {
      console.error("Suggestion: Verify that the standard input stream ('/dev/stdin') is accessible and provides data.");
    }
  }
})();