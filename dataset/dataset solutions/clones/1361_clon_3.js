// This robust script processes incoming data from standard input.
// It is designed to handle lines containing space-separated numerical values.
// The primary function of this utility is to parse these numerical entries,
// sort them in ascending numerical order, and then output the sorted sequence
// back to standard output, with elements separated by spaces.

/**
 * A dedicated comparison function for sorting numerical values.
 * This function is used by Array.prototype.sort() to establish
 * the correct ascending order for numbers.
 *
 * @param {number} firstOperand - The first numerical value for comparison.
 * @param {number} secondOperand - The second numerical value for comparison.
 * @returns {number} A negative value if firstOperand should come before secondOperand,
 *                   a positive value if firstOperand should come after secondOperand,
 *                   or zero if they are considered equal in order.
 */
const performNumericComparison = (firstOperand, secondOperand) => {
  // The standard way to sort numbers in ascending order in JavaScript.
  return firstOperand - secondOperand;
};

/**
 * This asynchronous handler function is invoked whenever a chunk of data
 * is received from the standard input stream. It encapsulates the entire
 * logic for processing a single line (or chunk) of input.
 *
 * @param {Buffer | string} receivedInputChunk - The raw data chunk received from stdin.
 *                                              It can be a Buffer or a string.
 */
const handleIncomingDataSegment = (receivedInputChunk) => {
  // Convert the input chunk to a string and remove any leading/trailing whitespace.
  // This ensures cleaner parsing and prevents issues with empty lines or accidental spaces.
  const processedInputString = receivedInputChunk.toString().trim();

  // Implement a guard clause: If the string is empty after trimming,
  // there's no data to process for this chunk. We simply exit the handler.
  if (processedInputString.length === 0) {
    return; // Skip processing for empty input lines.
  }

  // Split the cleaned string by one or more spaces to obtain an array of potential number strings.
  // Using a regular expression `/\s+/` handles multiple spaces between numbers robustly.
  const potentialNumberStrings = processedInputString.split(/\s+/);

  // Filter out any empty strings that might result from the splitting,
  // especially if the input had leading/trailing spaces before trimming or multiple spaces.
  const nonBlankStringTokens = potentialNumberStrings.filter(token => token.length > 0);

  // If, after splitting and filtering, no valid tokens remain, we have nothing to sort.
  if (nonBlankStringTokens.length === 0) {
    // Optionally, one might log a warning here if a line contained only whitespace.
    console.log(''); // Output an empty line to indicate no sortable content.
    return;
  }

  // Map each string token to its numerical representation.
  // The `Number()` constructor is robust; it converts valid number strings to numbers
  // and invalid ones to `NaN` (Not-a-Number).
  const parsedNumericElements = nonBlankStringTokens.map(strElement => Number(strElement));

  // Filter out any elements that failed to convert to a valid number (i.e., `NaN` values).
  // This ensures that only actual numbers participate in the sorting process.
  const validatedNumbersForSorting = parsedNumericElements.filter(numVal => !isNaN(numVal));

  // Another guard: If no valid numbers are left after parsing and validation,
  // there's nothing meaningful to sort or output for this line.
  if (validatedNumbersForSorting.length === 0) {
      console.log(''); // Output an empty line to signify no valid numerical data.
      return;
  }

  // Sort the array of validated numbers using our predefined comparison function.
  // This step rearranges the numbers into ascending order.
  const numericallyOrderedElements = validatedNumbersForSorting.sort(performNumericComparison);

  // Reconstruct the sorted numbers back into a single string,
  // with each number separated by a single space.
  const finalOutputString = numericallyOrderedElements.join(' ');

  // Print the resulting sorted string to the standard output.
  // This completes the processing for the current input chunk.
  console.log(finalOutputString);
};

// Configure the standard input stream to listen for 'data' events.
// Each time a 'data' event is emitted (indicating new input is available),
// our `handleIncomingDataSegment` function will be called to process it.
process.stdin.on('data', handleIncomingDataSegment);

// Optionally, one might add an 'end' event listener for cleanup or final actions
// when the input stream has completely finished. For this specific script,
// it's not strictly necessary but demonstrates an additional structural fragment.
// process.stdin.on('end', () => {
//   // console.error('Standard input stream has closed. All data processed.');
//   // No explicit action required for this simple sorting utility upon stream end.
// });