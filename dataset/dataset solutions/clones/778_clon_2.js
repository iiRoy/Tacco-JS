// This script processes input from standard input to decode sequences.
// Initializing a variable to accumulate incoming data.
let dataBuffer = '';

// Ensure the standard input stream remains open.
process.stdin.resume();
// Set the character encoding for incoming data.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks from stdin.
process.stdin.on('data', function(incomingChunk) {
  dataBuffer += incomingChunk; // Append the chunk to the buffer.
});

// Event listener for 'end' of stdin stream.
process.stdin.on('end', function() {
  // Split the accumulated data into an array of lines.
  dataBuffer = dataBuffer.split('\n');
  // Invoke the primary processing function.
  processInputData();
});

// Defines a mapping from numeric keypad digits to possible characters.
// The index corresponds to the digit pressed, and the inner array contains characters.
const keypadMap = [
  [],                               // Digit 0 (unused for character mapping)
  ['.', ',', '!', '?', ' '],        // Digit 1
  ['a', 'b', 'c'],                  // Digit 2
  ['d', 'e', 'f'],                  // Digit 3
  ['g', 'h', 'i'],                  // Digit 4
  ['j', 'k', 'l'],                  // Digit 5
  ['m', 'n', 'o'],                  // Digit 6
  ['p', 'q', 'r', 's'],             // Digit 7
  ['t', 'u', 'v'],                  // Digit 8
  ['w', 'x', 'y', 'z']              // Digit 9
];

// Function to decode a sequence of button presses into a string.
function decodeSequence(inputString) {
  let outputMessage = ''; // Stores the resulting decoded message.
  let currentDigit = '';  // Holds the digit currently being pressed.
  let pressCount = 0;     // Counts consecutive presses of the same digit.
  let charOptions;        // Temporary variable for character array from keypadMap.

  // Iterate through each character of the input sequence.
  for (let idx = 0; idx < inputString.length; idx++) {
    // If a '0' is encountered, it signifies the end of a digit sequence.
    if (inputString[idx] === '0') {
      // If there were actual presses before the '0', decode the character.
      if (pressCount !== 0) {
        // Retrieve the character options for the current digit.
        charOptions = keypadMap[+currentDigit];
        // Append the selected character to the output message.
        // The character is chosen based on (pressCount - 1) modulo the number of options.
        outputMessage += charOptions[(pressCount - 1) % charOptions.length];
      }
      // Reset the press count after decoding or if no presses occurred.
      pressCount = 0;
    } else {
      // If it's a digit, update the current digit and increment the press count.
      currentDigit = inputString[idx];
      pressCount++;
    }
  }
  return outputMessage; // Return the fully decoded message.
}

// Main function to orchestrate the decoding process for multiple test cases.
function processInputData() {
  // The first line of input contains the number of test cases.
  const numCases = +dataBuffer[0];

  // Loop through each test case, starting from the second line of input.
  for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
    // Decode the sequence for the current test case and print the result.
    console.log(decodeSequence(dataBuffer[caseIndex + 1]));
  }
}
