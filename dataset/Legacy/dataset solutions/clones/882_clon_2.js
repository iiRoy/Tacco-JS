/*
 * This module processes standard input to generate a Brainfuck-like sequence.
 * It calculates character code differences and translates them into a series of operations.
 */
var fileSystem = require('fs');

// Determine the size of the input stream from standard input
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming data
var inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var actualBytes = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines
var sourceLines = inputBuffer.toString('utf8', 0, actualBytes).split('\n');

// Initiate the primary processing function
processInput();

/**
 * The main function to process the first line of input.
 * It converts character differences into a specific output format.
 */
function processInput() {
  // Retrieve the first line of text from the input array
  var firstLine = sourceLines[0];

  // Initialize an empty string to accumulate the output result
  var resultString = '';

  // Declare loop counters and temporary variables
  var idx, lineLen, counter, charDifference, rootVal, signChar;

  // Store the previous character code for difference calculation, starting at 0
  var previousCode = 0;

  // Define a threshold value for difference handling
  const thresholdVal = 160;

  // An array to store character codes of the input line
  var codeSequence = [];

  // Populate the codeSequence array with character codes from the firstLine
  for (idx = 0, lineLen = firstLine.length; idx < lineLen; idx++) {
    codeSequence[idx] = firstLine.charCodeAt(idx);
  }

  // Iterate through the character codes to calculate differences and build the result string
  for (idx = 0; idx < lineLen; previousCode = codeSequence[idx], idx++) {
    // Calculate the difference between the current and previous character code
    charDifference = codeSequence[idx] - previousCode;

    // If there's no difference, append a '.' and move to the next character
    if (charDifference === 0) {
      resultString += '.';
      continue; // Skip to the next iteration
    }

    // Determine the sign character based on the difference
    signChar = charDifference > 0 ? '+' : '-';

    // Use the absolute value of the difference for further calculations
    charDifference = Math.abs(charDifference);

    // Handle differences below the defined threshold
    if (charDifference < thresholdVal) {
      // Append the sign character 'diff' times
      for (counter = charDifference; counter > 0; counter--) {
        resultString += signChar;
      }
    } else {
      // For larger differences, use a more complex sequence
      rootVal = ~~Math.sqrt(charDifference); // Integer square root

      resultString += '>'; // Move pointer right

      // Increment the current cell 'rootVal' times
      for (counter = rootVal; counter > 0; counter--) {
        resultString += '+';
      }

      resultString += '[<'; // Start loop: move left, then...

      // Apply the sign character 'rootVal' times to the cell to the left
      for (counter = rootVal; counter > 0; counter--) {
        resultString += signChar;
      }

      resultString += '>-]<'; // End loop: move right, then left

      // Handle the remaining difference (diff - rootVal * rootVal)
      for (counter = charDifference - rootVal * rootVal; counter > 0; counter--) {
        resultString += signChar;
      }
    }
    resultString += '.'; // Append a final '.' for the current character
  }

  // Output the generated result string to the console
  console.log(resultString);
}
