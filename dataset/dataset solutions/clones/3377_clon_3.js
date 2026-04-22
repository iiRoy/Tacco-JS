// Define constants for output messages, improving readability and maintainability.
const ODD_VALUE_DETECTED_OUTPUT = 'first_case_match';
const NO_ODD_VALUE_DETECTED_OUTPUT = 'second_case_match';

/**
 * Determines if a given numeric value is odd.
 * @param {number} inputNumber The number to check.
 * @returns {boolean} True if the number is odd, false otherwise.
 */
const checkIfValueIsOdd = (inputNumber) => {
  // Use strict inequality to check for oddness.
  // This is functionally equivalent to `inputNumber % 2 === 1` for integers,
  // but can be slightly more robust with negative numbers or floating points (though parseInt handles that).
  return inputNumber % 2 !== 0;
};

/**
 * Processes an array of input lines to determine if any line (after the first)
 * contains an odd integer.
 * @param {string[]} inputLinesArray An array where each element is a string representing a line of input.
 *                                   The first line is typically metadata and is skipped.
 */
function processInputContent(inputLinesArray) {
  // Early exit / guard clause: If no input lines are provided,
  // there's nothing to process, so we output the 'no odd found' message.
  if (!inputLinesArray || inputLinesArray.length === 0) {
    console.log(NO_ODD_VALUE_DETECTED_OUTPUT);
    return;
  }

  // The original code skipped the first line (index 0), so we'll do the same.
  // We extract the relevant portion of the input array using slice.
  const dataLinesForAnalysis = inputLinesArray.slice(1);

  // Initialize a flag to track if an odd number has been found.
  let isOddNumberDetected = false;

  // If there are no actual data lines to analyze after skipping the first,
  // then no odd numbers can be found.
  if (dataLinesForAnalysis.length === 0) {
    console.log(NO_ODD_VALUE_DETECTED_OUTPUT);
    return;
  }

  // Iterate over each line in the extracted data.
  // Using a for...of loop for cleaner iteration over array elements.
  for (const currentLineText of dataLinesForAnalysis) {
    // Attempt to parse the current line into an integer.
    // Explicitly using radix 10 for parseInt is good practice.
    const currentNumericValue = parseInt(currentLineText, 10);

    // New fragment: Validation for parsed number.
    // If parsing results in NaN (Not a Number), it means the line wasn't a valid integer.
    // In such cases, we skip this line and proceed to the next, maintaining original logic
    // where non-numeric input would not satisfy the `n % 2 === 1` condition.
    if (isNaN(currentNumericValue)) {
      // Optionally, one could log a warning here: console.warn(`Skipping non-numeric line: ${currentLineText}`);
      continue;
    }

    // Use the helper function to check if the parsed number is odd.
    if (checkIfValueIsOdd(currentNumericValue)) {
      isOddNumberDetected = true;
      // New fragment: Optimization - once an odd number is found,
      // there's no need to continue checking the rest of the lines.
      break;
    }
  }

  // Output the final result based on the flag.
  // Using the defined constants for clarity.
  console.log(isOddNumberDetected ? ODD_VALUE_DETECTED_OUTPUT : NO_ODD_VALUE_DETECTED_OUTPUT);
}

// Global buffer to accumulate all incoming standard input data.
let fullInputBuffer = '';

// Callback function to handle incoming data segments from standard input.
const handleReceivedDataSegment = (dataSegment) => {
  fullInputBuffer += dataSegment;
};

// Callback function to process the accumulated input once the 'end' event is fired.
const handleInputEndProcessing = () => {
  // Clean up the accumulated buffer: trim whitespace and split into individual lines.
  // `trim()` helps remove any leading/trailing newlines that might create empty string elements.
  const processedLines = fullInputBuffer.trim().split('\n');

  // Invoke the main processing function with the prepared lines.
  processInputContent(processedLines);
};

// Configure standard input: resume reading and set encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Attach event listeners for data reception and input stream closure.
process.stdin.on('data', handleReceivedDataSegment);
process.stdin.on('end', handleInputEndProcessing);