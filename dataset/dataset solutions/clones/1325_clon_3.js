// This variable will accumulate all data received from standard input.
let inputDataBuffer = '';

// Activates the standard input stream to begin listening for data.
process.stdin.resume();

// Configures the standard input stream to interpret incoming bytes as UTF-8 encoded characters.
process.stdin.setEncoding('utf8');

// Attaches an event listener to the standard input stream.
// This function is executed whenever a chunk of data is received.
process.stdin.on('data', (dataChunk) => {
  // Appends the current data chunk to our buffer.
  inputDataBuffer += dataChunk;
});

// Attaches an event listener for the 'end' event on the standard input stream.
// This function is executed once all input has been received and the stream closes.
process.stdin.on('end', () => {
  // Pre-process the accumulated input: trim leading/trailing whitespace and split into an array of lines.
  const allInputLines = inputDataBuffer.trim().split('\n');

  // Guard clause: If the input is empty or consists only of whitespace, there's nothing to process.
  if (allInputLines.length === 0 || (allInputLines.length === 1 && allInputLines[0] === '')) {
    return; // Exit the function gracefully.
  }

  // The very first line of input is designated as the initial string for manipulation.
  let currentWorkingString = allInputLines[0];

  // The subsequent lines are considered command lines that either perform a rotation
  // or introduce a new working string while collecting the previous one.
  const commandLines = allInputLines.slice(1);

  // This array will store the strings that are collected as final outputs.
  const collectedResults = [];

  // Initialize a cursor to iterate through the command lines.
  let lineCursor = 0;

  // Process each command line sequentially.
  while (lineCursor < commandLines.length) {
    const currentLine = commandLines[lineCursor];

    // Attempt to convert the current line into an integer, assuming base 10.
    const parsedNumericValue = parseInt(currentLine, 10);

    // Check if the parsed value is a valid integer. This determines the action.
    if (Number.isInteger(parsedNumericValue)) {
      // If it's an integer, perform a cyclic shift on the current working string.
      currentWorkingString = performCyclicShift(currentWorkingString, parsedNumericValue);
    } else {
      // If it's not an integer, the current working string is considered a result.
      collectedResults.push(currentWorkingString);
      // The non-integer line itself becomes the new current working string.
      currentWorkingString = currentLine;
    }
    // Advance the cursor to the next command line.
    lineCursor++;
  }

  // Finally, print all collected results, with each result separated by a newline.
  console.log(collectedResults.join('\n'));
});

/**
 * Executes a cyclic left shift (rotation) operation on a given string.
 * This effectively moves characters from the beginning of the string to its end.
 *
 * @param {string} sourceString - The string on which the rotation is to be performed.
 * @param {number} rotationOffset - The number of positions by which to shift the string.
 *                                  A positive value shifts characters from the start to the end.
 * @returns {string} The string after the cyclic shift has been applied.
 */
function performCyclicShift(sourceString, rotationOffset) {
  // Handle edge case: an empty string cannot be rotated.
  if (sourceString.length === 0) {
    return '';
  }

  // Calculate an effective offset that is non-negative and within the string's length bounds.
  // This handles cases where rotationOffset is negative or larger than the string length,
  // ensuring a correct cyclic behavior.
  let effectiveOffset = rotationOffset % sourceString.length;
  if (effectiveOffset < 0) {
    effectiveOffset += sourceString.length; // Convert negative modulo result to a positive equivalent.
  }

  // Divide the string into two segments based on the effective offset.
  // The first segment consists of characters to be moved to the end.
  const segmentToMoveToEnd = sourceString.substring(0, effectiveOffset);
  // The second segment consists of the remaining characters that will form the new beginning.
  const remainingSegment = sourceString.substring(effectiveOffset);

  // Concatenate the remaining segment with the moved segment to complete the rotation.
  return remainingSegment + segmentToMoveToEnd;
}