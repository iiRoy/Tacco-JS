var fileSystem = require('fs');

/*
 * This module processes standard input to generate a specific output string.
 * It reads the entire content of stdin, splits it by newlines, and then
 * performs character code manipulations on the first line.
 */
var fileSize = fileSystem.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(fileSize);
var readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary processing function.
processInput();

function processInput() {
  var firstLine = inputLines[0];
  var resultString = '';
  var idx, lineLength, counter, difference, squareRootVal, signChar;
  var previousCode = 0;
  var thresholdValue = 16; // A constant used for conditional logic.
  var characterCodes = [];

  // Populate an array with character codes from the input string.
  for (idx = 0, lineLength = firstLine.length; idx < lineLength; idx++) {
    characterCodes[idx] = firstLine.charCodeAt(idx);
  }

  // Iterate through the character codes to build the result string.
  for (idx = 0; idx < lineLength; previousCode = characterCodes[idx], idx++) {
    difference = characterCodes[idx] - previousCode;
    signChar = difference > 0 ? '+' : '-';
    difference = Math.abs(difference);

    if (difference < thresholdValue) {
      // If the absolute difference is small, append direct +/- characters.
      for (counter = difference; counter > 0; counter--) {
        resultString += signChar;
      }
    } else {
      // For larger differences, use a more complex brainfuck-like pattern.
      squareRootVal = ~~Math.sqrt(difference); // Integer square root.
      resultString += '>';
      for (counter = squareRootVal; counter > 0; counter--) {
        resultString += '+';
      }
      resultString += '[<';
      for (counter = squareRootVal; counter > 0; counter--) {
        resultString += signChar;
      }
      resultString += '>-]<';
      for (counter = difference - squareRootVal * squareRootVal; counter > 0; counter--) {
        resultString += signChar;
      }
    }
    resultString += '.'; // Append a dot for each processed character.
  }

  // Output the final generated string to the console.
  console.log(resultString);
}
