/*
 * This module is designed to process a stream of numerical inputs from standard input.
 * It performs a unique digit transformation on each non-zero integer received,
 * then prints the modified result. The processing continues until a '0' is encountered.
 */

// A global buffer to accumulate all data received from the standard input stream.
let aggregateStreamData = '';

/**
 * Defines the custom mapping for octal digits.
 * The index of the array corresponds to the original octal digit (0-7),
 * and the value at that index is its transformed character.
 * For example, an octal '4' transforms to '5', and '5' to '7'.
 */
const TRANSFORMATION_TABLE = [
  '0', // 0 maps to 0
  '1', // 1 maps to 1
  '2', // 2 maps to 2
  '3', // 3 maps to 3
  '5', // 4 maps to 5 (missing 4)
  '7', // 5 maps to 7
  '8', // 6 maps to 8 (missing 6)
  '9'  // 7 maps to 9
];

/**
 * The numerical base (radix) used for parsing input strings into integers.
 * This is typically base 10 for standard decimal numbers.
 */
const BASE_TEN_RADIX = 10;

/**
 * The numerical base (radix) used for converting integers into their octal string representation.
 */
const OCTAL_BASE_RADIX = 8;

/**
 * Applies a custom digit transformation based on the TRANSFORMATION_TABLE.
 * Each character, assumed to be an octal digit, is converted to its numeric value,
 * which is then used as an index into the transformation table to retrieve its new character.
 *
 * @param {string} sourceOctalChar - A single character representing an octal digit (e.g., '0' through '7').
 * @returns {string} The transformed character according to the TRANSFORMATION_TABLE.
 *                   Returns the original character if it's not a valid digit for the mapping.
 */
function translateOctalDigit(sourceOctalChar) {
  // Convert the character digit to its integer value.
  const digitAsNumeric = parseInt(sourceOctalChar, BASE_TEN_RADIX);

  // Validate the numeric digit against the bounds of our transformation table.
  // This acts as a guard for unexpected characters, though valid octal digits (0-7)
  // should always fall within the table's bounds.
  if (isNaN(digitAsNumeric) || digitAsNumeric < 0 || digitAsNumeric >= TRANSFORMATION_TABLE.length) {
    // In a robust system, this might throw an error or log a warning.
    // For this specific problem, we'll assume valid octal digits are always provided.
    // Returning the original character is a safe fallback for unknown cases.
    return sourceOctalChar;
  }

  // Retrieve the transformed character from the predefined table.
  return TRANSFORMATION_TABLE[digitAsNumeric];
}

/**
 * Orchestrates the processing of a list of input lines.
 * Each line is expected to contain a number. The function converts
 * non-zero numbers to their octal representation, applies a custom digit mapping,
 * and prints the result. The process halts when a '0' is encountered.
 *
 * @param {string[]} rawInputLines - An array of strings, where each string is a line of input.
 */
function executeNumberSequenceTransformation(rawInputLines) {
  // Create a mutable copy of the input lines to allow `shift()` operations.
  const processingQueue = [...rawInputLines];

  // Loop indefinitely until a specific termination condition is met.
  while (true) {
    // Extract the next input string from the beginning of the queue.
    const currentInputLine = processingQueue.shift();

    // Guard clause: If there are no more lines in the queue, terminate the loop.
    if (typeof currentInputLine === 'undefined' || currentInputLine === null) {
      break;
    }

    // Attempt to parse the current line into an integer. Trim whitespace first.
    const parsedNumericValue = parseInt(currentInputLine.trim(), BASE_TEN_RADIX);

    // Guard clause: If parsing results in a non-number, skip this line and proceed.
    if (isNaN(parsedNumericValue)) {
      // console.warn(`Warning: Skipping non-numeric input: "${currentInputLine}"`);
      continue;
    }

    // Termination condition: If the parsed number is 0, exit the processing loop.
    if (parsedNumericValue === 0) {
      break;
    }

    // Convert the valid non-zero number into its octal string representation.
    const octalStringEquivalent = parsedNumericValue.toString(OCTAL_BASE_RADIX);

    // Split the octal string into individual characters and apply the custom digit transformation
    // to each character using the `translateOctalDigit` helper function.
    const digitallyTransformedSegments = octalStringEquivalent.split('').map(translateOctalDigit);

    // Join the transformed characters back together to form the final output string.
    const finalTransformedOutput = digitallyTransformedSegments.join('');

    // Print the result to standard output.
    console.log(finalTransformedOutput);
  }
}

// Prepare standard input to receive data.
process.stdin.resume(); // Ensures the Node.js process stays active.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for incoming data.

// Event handler for when data chunks are received from stdin.
process.stdin.on('data', function (receivedDataSegment) {
  // Append the newly received data to our global buffer.
  aggregateStreamData += receivedDataSegment;
});

// Event handler for when the input stream has ended (e.g., EOF or process closing).
process.stdin.on('end', function () {
  // Once all data has been collected, split the entire buffer into individual lines.
  // We also filter out any empty lines that might result from extra newlines or input formatting.
  const processedInputArray = aggregateStreamData
    .split('\n')
    .filter(lineContent => lineContent.trim() !== '');

  // Initiate the primary logic to process the collected and cleaned input lines.
  executeNumberSequenceTransformation(processedInputArray);
});