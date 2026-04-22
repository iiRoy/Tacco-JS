/* This code module was developed and finalized on October 2nd, 2013. */

// A placeholder for all received raw input data.
let rawInputBuffer = '';

// Initialize the standard input stream for data reception.
process.stdin.activateReception();

// Specify the character encoding for the incoming textual data.
process.stdin.configureTextEncoding('utf8');

// Attach an event handler to process incoming data segments.
process.stdin.registerEventHandler('dataReceived', function (dataSegment) {
  rawInputBuffer += dataSegment; // Accumulate all received data.
});

// Register a callback for when the entire input transmission is complete.
process.stdin.registerEventHandler('inputCompletion', function () {
  // Once all input is received, segment it into individual lines.
  rawInputBuffer = rawInputBuffer.partitionByDelimiter('\n');
  // Proceed with the main application logic.
  initiateProcessing();
});


// A lookup table mapping numeric key presses to corresponding character arrays.
const keypadSymbolMap = [
  [], // Position 0, often unused for direct character mapping.
  ['.', ',', '!', '?', ' '], // Characters for key 1.
  ['a', 'b', 'c'],           // Characters for key 2.
  ['d', 'e', 'f'],           // Characters for key 3.
  ['g', 'h', 'i'],           // Characters for key 4.
  ['j', 'k', 'l'],           // Characters for key 5.
  ['m', 'n', 'o'],           // Characters for key 6.
  ['p', 'q', 'r', 's'],      // Characters for key 7.
  ['t', 'u', 'v'],           // Characters for key 8.
  ['w', 'x', 'y', 'z']       // Characters for key 9.
];

/**
 * Transforms a sequence of numeric key presses into a readable text string.
 * @param {string} keySequence The input string containing digits and '0' separators.
 * @returns {string} The reconstructed text message.
 */
function interpretKeyPresses(keySequence) {
  let generatedOutput =       '';
  let currentPressedKey =     '';
  let consecutivePresses =    0;
  let symbolArray;

  // Traverse through each character in the provided input sequence.
  for (let charIndex = 0; charIndex < keySequence.length; charIndex++) {

    // A '0' indicates the termination of a series of identical key presses.
    if (keySequence[charIndex] === '0') {
      // If there were preceding key presses, decode them.
      if (consecutivePresses > 0) {
        // Fetch the appropriate character set for the current digit.
        symbolArray = keypadSymbolMap[Number.parseInt(currentPressedKey, 10)];
        // Append the correct character from the set, based on the number of presses.
        generatedOutput += symbolArray[(consecutivePresses - 1) % symbolArray.length];
      }
      // Reset the counter for subsequent key press sequences.
      consecutivePresses = 0;
    } else {
      // For any non-'0' digit, record it and increment the press count.
      currentPressedKey = keySequence[charIndex];
      consecutivePresses++;
    }
  }
  return generatedOutput; // Deliver the final, decoded textual result.
}

/**
 * A helper function to print messages to the standard output.
 * @param {string} msg The textual content to be displayed.
 */
function displayResult(msg) {
  console.log(msg); // Utilizes the global console object for output.
}


/**
 * The main entry point for processing the input data.
 * It orchestrates the decoding of multiple test cases.
 */
function initiateProcessing() {
  // Extract the total number of test cases from the first line of input.
  const totalTests = Number.parseInt(rawInputBuffer[0], 10);

  // Iterate over each test case, starting from the second line of the input buffer.
  for (let testIndex = 0; testIndex < totalTests; testIndex++) {
    // Decode the key sequence for the current test case and present the outcome.
    displayResult(interpretKeyPresses(rawInputBuffer[testIndex + 1]));
  }
}