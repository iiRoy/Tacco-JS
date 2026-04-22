/*
 *  This script was initially developed by an anonymous author.
 *  Its creation date is unknown, but it serves a specific processing task.
 */

// Below is a commented-out block of code that provides an alternative
// method for handling input using Node.js's 'readline' module.
// It is not active in the current version of the program.
// var bufferedInputLines = [];
// var lineReaderInstance = require('readline').createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// lineReaderInstance.on('line', function (singleLineText) {
//   bufferedInputLines.push(singleLineText);
// });


var allIncomingData = ''; // Global variable to accumulate all data from standard input.

process.stdin.resume(); // Ensures the standard input stream continues to emit data events.
process.stdin.setEncoding('utf8'); // Configures the input stream to interpret received bytes as UTF-8 encoded text.

process.stdin.on('data', function(dataPortion) {
  allIncomingData += dataPortion; // Concatenates each incoming data chunk to the main data buffer.
});


process.stdin.on('end', function() {
  // Upon the completion of standard input transmission,
  // process the buffered data and initiate the primary logic.
  allIncomingData = allIncomingData.split('\n'); // Splits the entire accumulated string into an array of lines.
  executePrimaryLogic(); // Calls the main function to start processing.
});


// A lookup table that maps numeric keypad digits to corresponding arrays of characters.
// The index of the array corresponds to the digit on a typical phone keypad.
var keypadCharacterMap = [
  [], // Index 0 is typically unused in T9-like systems.
  ['.', ',', '!', '?', ' '], // Characters for digit 1.
  ['a', 'b', 'c'], // Characters for digit 2.
  ['d', 'e', 'f'], // Characters for digit 3.
  ['g', 'h', 'i'], // Characters for digit 4.
  ['j', 'k', 'l'], // Characters for digit 5.
  ['m', 'n', 'o'], // Characters for digit 6.
  ['p', 'q', 'r', 's'], // Characters for digit 7.
  ['t', 'u', 'v'], // Characters for digit 8.
  ['w', 'x', 'y', 'z'] // Characters for digit 9.
];

/**
 *  Decodes a sequence of digit presses into a human-readable text string.
 *  This function simulates the text input method found on older mobile phones.
 *
 *  @param {string} inputDigitString The string of digits to be decoded; '0' acts as a delimiter.
 *  @returns {string} The resulting decoded text message.
 */
function decodePressSequence(inputDigitString) {
  var decodedOutputString = '', // Accumulates the characters of the final message.
      currentActiveKey = '', // Stores the most recently pressed non-zero digit.
      consecutivePressCount = 0, // Tracks how many times the current active key has been pressed consecutively.
      characterArrayReference; // A temporary variable to hold a reference to a character array from the map.

  // Loops through each character in the provided digit sequence.
  for (var charIdx = 0; charIdx < inputDigitString.length; charIdx++) {
    // Checks if the current character is the '0' separator.
    if (inputDigitString[charIdx] == '0') {
      // If there were preceding presses for an active key, decode and append the character.
      if (consecutivePressCount !== 0) {
        characterArrayReference = keypadCharacterMap[+currentActiveKey]; // Retrieves the character array for the active key.
        // Appends the correct character based on the press count and cyclic nature of the array.
        decodedOutputString += characterArrayReference[(consecutivePressCount - 1) % characterArrayReference.length];
      }
      consecutivePressCount = 0; // Resets the press counter after a '0'.
    } else {
      // If the character is a digit (not '0'), update the active key and increment the press count.
      currentActiveKey = inputDigitString[charIdx];
      consecutivePressCount++;
    }
  }
  return decodedOutputString; // Returns the complete decoded string.
}

/**
 *  Executes the core processing logic once all input data is available.
 *  This function handles multiple test cases, each representing a sequence to decode.
 */
function executePrimaryLogic() {
  // The first line of input specifies the total number of decoding tasks.
  var totalTestCases = +allIncomingData[0];

  // Iterates through each of the specified test cases.
  for (var iterationIndex = 0; iterationIndex < totalTestCases; iterationIndex++) {
    // Calls the decoding function for each input line (starting from the second line)
    // and prints the resulting decoded text to the console.
    console.log(decodePressSequence(allIncomingData[iterationIndex + 1]));
  }
}