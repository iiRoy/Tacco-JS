let inputBuffer = ''; // Buffer to accumulate incoming data from standard input.

// Resume standard input to start receiving data.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' event on standard input.
// Appends received data chunks to the inputBuffer.
process.stdin.on('data', (dataChunk) => {
  inputBuffer += dataChunk;
});

// Event listener for 'end' event on standard input.
// This block executes once all input has been received.
process.stdin.on('end', () => {
  // Trim whitespace from the accumulated input and split it into lines.
  // The first line is treated as the initial string, and the rest are subsequent commands.
  let [currentString, ...inputLines] = inputBuffer.trim().split('\n');

  // An array to store the resulting strings that need to be printed.
  const outputCollection = [];

  // Iterate through the command lines, starting from the second line (index 1).
  for (let idx = 1; idx < inputLines.length; idx++) {
    // Attempt to parse the current line as an integer, representing a shift amount.
    const shiftAmount = parseInt(inputLines[idx], 10);

    // Check if the parsed value is a valid number.
    if (!isNaN(shiftAmount)) {
      // If it's a number, perform a string rotation (shuffle) on the current string.
      currentString = rotateString(currentString, shiftAmount);
    } else {
      // If it's not a number, it signifies a new starting string.
      // Add the current string to the collection of results.
      outputCollection.push(currentString);
      // Set the current line as the new starting string.
      currentString = inputLines[idx];
      // Increment the index again because the next line (idx + 1) is also part of this command.
      idx++;
    }
  }

  // Print all collected result strings, joined by newline characters.
  console.log(outputCollection.join('\n'));
});

/**
 * Rotates a given string by a specified number of characters.
 * Characters from the beginning of the string are moved to the end.
 *
 * @param {string} inputStr - The string to be rotated.
 * @param {number} rotationVal - The number of characters to shift from the beginning to the end.
 * @returns {string} The rotated string.
 */
const rotateString = (inputStr, rotationVal) =>
  inputStr.slice(rotationVal) + inputStr.slice(0, rotationVal);
