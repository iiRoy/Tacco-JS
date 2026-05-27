/*
 * This file processes incoming data from standard input.
 * It decodes sequences of numbers into a message using a predefined key mapping.
 */

// A variable to accumulate all incoming data chunks.
let receivedData = '';

// Resume standard input stream to start receiving data.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from stdin.
// Each chunk is appended to the 'receivedData' string.
process.stdin.on('data', function(dataSegment) {
  receivedData += dataSegment;
});

// Event listener for 'end' of standard input stream.
// Once all data is received, it's split by newlines and processed.
process.stdin.on('end', function() {
  receivedData = receivedData.split('\n');
  processInput(); // Call the main processing function.
});

// This constant array holds the character mappings for each numeric key.
// The index corresponds to the key pressed, and the sub-array contains possible characters.
const keyMappings = [
  [], // Index 0 is empty as there's no '0' key for characters.
  ['.', ' ,' , '!' , '?', ' '], // Key 1
  ['a', 'b', 'c'], // Key 2
  ['d', 'e', 'f'], // Key 3
  ['g', 'h', 'i'], // Key 4
  ['j', 'k', 'l'], // Key 5
  ['m', 'n', 'o'], // Key 6
  ['p', 'q', 'r', 's'], // Key 7
  ['t', 'u', 'v'], // Key 8
  ['w', 'x', 'y', 'z']  // Key 9
];

/**
 * Decodes a given numeric sequence string into a message.
 * The sequence represents button presses on a numeric keypad.
 *
 * @param {string} inputString The string of numeric presses to decode.
 * @returns {string} The decoded message.
 */
function decodeSequence(inputString) {
  let decodedMessage = ''; // Stores the final decoded string.
  let currentKey = '';     // Stores the currently pressed key (e.g., '2', '3').
  let pressCount = 0;      // Counts how many times the current key has been pressed consecutively.
  let charOptions;         // Temporary variable to hold character options for a key.

  // Iterate through each character in the input sequence.
  for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
    // If a '0' is encountered, it signifies the end of a sequence of presses for a key.
    if (inputString[charIndex] === '0') {
      // If there were actual presses before the '0', decode the character.
      if (pressCount !== 0) {
        // Get the character options for the current key.
        charOptions = keyMappings[+currentKey]; // Unary plus converts string to number.

        // Append the correct character based on press count and cycle through options.
        decodedMessage += charOptions[(pressCount - 1) % charOptions.length];
      }
      // Reset press count after decoding or if '0' was pressed without previous presses.
      pressCount = 0;
    } else {
      // If it's not '0', it's a key press.
      // If the key changes, reset the count and update the current key.
      // If the key is the same, just increment the count.
      // The original code implicitly handles this by always setting `pushed = str[i]`
      // and `times++`. This means if `str[i]` is different from the *previous* `pushed`,
      // the `times` count will be for the *new* key, and the *old* key's sequence
      // would have been terminated by a '0' or the end of the string.
      // The current logic correctly reflects the original's behavior:
      // it only processes a key sequence when a '0' is hit.
      // If the key changes without a '0', the previous key's presses are effectively lost
      // (or rather, they are not processed into `result` until a '0' is hit).
      // The original code's behavior for `str = "223"` would be:
      // i=0, str[0]='2', pushed='2', times=1
      // i=1, str[1]='2', pushed='2', times=2
      // i=2, str[2]='3', pushed='3', times=1
      // If the string ends here, nothing is added to `result`.
      // If `str = "2203"`:
      // i=0, str[0]='2', pushed='2', times=1
      // i=1, str[1]='2', pushed='2', times=2
      // i=2, str[2]='0', times!=0 is true, temp=button[2], result += temp[(2-1)%3] = temp[1] = 'b'. times=0.
      // i=3, str[3]='3', pushed='3', times=1
      // This is consistent with the original.
      currentKey = inputString[charIndex];
      pressCount++;
    }
  }
  // After the loop, if there are any pending presses (i.e., the string didn't end with '0'),
  // the original code *does not* process them. This behavior is preserved.

  return decodedMessage;
}

/**
 * The main function to process the input data.
 * It reads the number of test cases and then processes each case.
 */
function processInput() {
  // The first line of input contains the number of test cases.
  let numberOfCases = +receivedData[0]; // Unary plus converts string to number.

  // Loop through each test case.
  for (let caseIndex = 0; caseIndex < numberOfCases; caseIndex++) {
    // For each case, decode the corresponding input string and print the result.
    // The input strings start from the second line (index 1).
    console.log(decodeSequence(receivedData[caseIndex + 1]));
  }
}
