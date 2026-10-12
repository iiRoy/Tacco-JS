var fileSystem = require('fs'),
    // Determine the size of the standard input stream.
    dataSize = fileSystem.fstatSync(process.stdin.fd).size,
    // Allocate a buffer to hold the input data.
    inputBuffer = new Buffer(dataSize),
    // Read data from standard input into the buffer.
    readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0),
    // Convert the buffer to a UTF-8 string and split it into lines.
    linesOfInput = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Execute the primary processing function.
processInputData();

/**
 * Main function to process the input string and generate an output sequence.
 */
function processInputData() {
  var targetString = linesOfInput[0], // Get the first line of input.
      resultOutput = '',              // Initialize the output string.
      idx,                            // Loop index for string iteration.
      stringLength,                   // Length of the target string.
      counter,                        // General-purpose loop counter.
      difference,                     // Difference between current and previous character codes.
      squareRootVal,                  // Integer square root for larger differences.
      plusMinusChar,                  // Character ('+' or '-') based on difference sign.
      previousCode = 0,               // Stores the character code of the previous character.
      thresholdValue = 16,            // A constant threshold for difference handling.
      characterCodeArray = [];        // Array to store character codes of the target string.

  // Populate the character code array.
  for (idx = 0, stringLength = targetString.length; idx < stringLength; idx++) {
    characterCodeArray[idx] = targetString.charCodeAt(idx);
  }

  // Iterate through the character codes to generate the output.
  for (idx = 0; idx < stringLength; previousCode = characterCodeArray[idx], idx++) {
    difference = characterCodeArray[idx] - previousCode;

    // If the difference is zero, append a dot and continue.
    if (difference === 0) {
      resultOutput += '.';
      continue;
    }

    // Determine the sign character.
    plusMinusChar = difference > 0 ? '+' : '-';
    difference = Math.abs(difference); // Work with the absolute difference.

    // Handle differences based on the threshold.
    if (difference < thresholdValue) {
      // For small differences, append the sign character multiple times.
      for (counter = difference; counter > 0; counter--) {
        resultOutput += plusMinusChar;
      }
    } else {
      // For larger differences, use a more complex sequence involving square roots.
      squareRootVal = ~~Math.sqrt(difference); // Integer square root.
      resultOutput += '>'; // Start with a '>'

      // Append '+' characters based on the square root.
      for (counter = squareRootVal; counter > 0; counter--) {
        resultOutput += '+';
      }
      resultOutput += '[<'; // Add the loop structure.

      // Append sign characters based on the square root inside the loop.
      for (counter = squareRootVal; counter > 0; counter--) {
        resultOutput += plusMinusChar;
      }
      resultOutput += '>-]<'; // Close the loop structure.

      // Handle the remaining difference after the square root operation.
      for (counter = difference - squareRootVal * squareRootVal; counter > 0; counter--) {
        resultOutput += plusMinusChar;
      }
    }
    resultOutput += '.'; // Append a dot after processing each character.
  }

  // Output the final generated string to the console.
  console.log(resultOutput);
}
