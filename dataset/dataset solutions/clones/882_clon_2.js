/*
 *  Module for text transformation.
 *  Generated on 2023-10-27 by a code clone generator.
 */

var fileUtility = require('fs'),
    totalBytes = fileUtility.fstatSync(process.stdin.fd).size,
    dataStorage = new Buffer(totalBytes),
    octetsRead = fileUtility.readSync(process.stdin.fd, dataStorage, 0, totalBytes, 0),
    sourceLines = dataStorage.toString('utf8', 0, octetsRead).split('\n');

processSequence(); // Initiate the main processing flow.

function processSequence() {
  var firstLine = sourceLines[0],
    outputString = '',
    idx, limit, counter, delta, rootVal, signChar,
    previousCode = 0,
    thresholdValue = 160,
    characterCodes = [];

  // Populate an array with character codes from the input string.
  for (idx = 0, limit = firstLine.length; idx < limit; idx++) {
    characterCodes[idx] = firstLine.charCodeAt(idx);
  }

  // Iterate through the character codes to generate the output string.
  for (idx = 0; idx < limit; previousCode = characterCodes[idx], idx++) {
    delta = characterCodes[idx] - previousCode; // Calculate the difference from the previous character.

    if (delta === 0) {
      outputString += '.';
      continue; // Skip further processing if no change.
    }

    signChar = delta > 0 ? '+' : '-'; // Determine the sign character.
    delta = Math.abs(delta); // Use the absolute value of the difference.

    if (delta < thresholdValue) {
      // For smaller differences, append the sign character repeatedly.
      for (counter = delta; counter > 0; counter--) {
        outputString += signChar;
      }
    } else {
      // For larger differences, apply a more complex transformation.
      rootVal = ~~Math.sqrt(delta); // Integer square root.
      outputString += '>';
      for (counter = rootVal; counter > 0; counter--) {
        outputString += '+';
      }
      outputString += '[<';
      for (counter = rootVal; counter > 0; counter--) {
        outputString += signChar;
      }
      outputString += '>-]<';
      for (counter = delta - rootVal * rootVal; counter > 0; counter--) {
        outputString += signChar;
      }
    }
    outputString += '.'; // Append a dot after each character's transformation.
  }
  console.log(outputString); // Display the final generated string.
}