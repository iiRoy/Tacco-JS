var fileSystemModule = require('fs'); // Import the Node.js file system module for file operations.

// Determine the total byte length of the standard input stream.
var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a new Buffer object to store the incoming data.
var inputBuffer = new Buffer(dataLength);

// Read the entire content from standard input into the allocated buffer.
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);

// Convert the buffer's content to a UTF-8 string and then split it into an array of lines.
var processedInputLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Initiate the main execution sequence of the program.
executeProgram();

/**
 * Generates a string by repeating a given character a specified number of times.
 *
 * @param {number} count The total number of times the character should be repeated.
 * @param {string} character The single character to be repeated.
 * @returns {string} A new string composed of the repeated character.
 */
function generateCharSequence(count, character) {
  var loopIndex; // Iterator for the repetition loop.
  var resultString = ''; // Accumulator for the generated sequence.

  // Loop downwards from 'count' to 1, appending the character in each iteration.
  for (loopIndex = count; loopIndex > 0; loopIndex--) {
    resultString += character;
  }
  return resultString; // Return the final concatenated string.
}

/**
 * This is the primary function that orchestrates the logic to convert an input string
 * into a Brainfuck-like sequence of commands.
 */
function executeProgram() {
  // Extract the first line from the processed input array.
  var targetString = processedInputLines[0];

  // Get the character length of the target string.
  var stringLength = targetString.length;

  // Initialize the Brainfuck output string with a predefined setup sequence.
  var brainfuckOutput = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>';

  // Declare several variables that will be used within the main processing loop.
  var charIndex, loopCounterJ, differenceValue, squareVal, squareVal2;

  // Variable to hold either a '+' or '-' character for cell value adjustments.
  var plusMinusChar = '';

  // An array storing the last processed character code for each of the 10 pointer positions.
  var previousValuesArray = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120];

  // Represents the current active pointer position in the conceptual Brainfuck memory.
  var currentPointerPosition = 0;

  // Will store the calculated next pointer position for the current character.
  var nextPointerPosition;

  // A constant value, declared but not utilized in the original algorithm's executable logic.
  var constantN = 9;

  // Variable to store the ASCII character code of the current character being processed.
  var currentCharCode;

  // Iterate through each character of the input string to generate corresponding Brainfuck commands.
  for (charIndex = 0; charIndex < stringLength; charIndex++) {
    // Obtain the ASCII (Unicode) value of the character at the current index.
    currentCharCode = targetString.charCodeAt(charIndex);

    // Calculate the target pointer position based on the character code.
    // The `~~` operator performs a bitwise NOT twice, effectively truncating to an integer (Math.floor).
    nextPointerPosition = ~~((currentCharCode - 33) / 11);

    // Append Brainfuck pointer movement commands ('>' or '<') to reach the `nextPointerPosition`.
    brainfuckOutput += generateCharSequence(Math.abs(currentPointerPosition - nextPointerPosition), currentPointerPosition < nextPointerPosition ? '>' : '<');

    // Calculate the numerical difference between the current character's code and its previously stored value.
    differenceValue = currentCharCode - previousValuesArray[nextPointerPosition];

    // Determine whether to use '+' (increment) or '-' (decrement) based on the difference.
    plusMinusChar = differenceValue > 0 ? '+' : '-';

    // Take the absolute value of the difference, as `generateCharSequence` expects a positive count.
    differenceValue = Math.abs(differenceValue);

    // Append Brainfuck cell value adjustment commands ('+' or '-') based on the calculated difference.
    brainfuckOutput += generateCharSequence(differenceValue, plusMinusChar);

    // Update the `previousValuesArray` with the current character's code for the `nextPointerPosition`.
    previousValuesArray[nextPointerPosition] = currentCharCode;

    // Append the Brainfuck output command ('.') to print the current cell's value.
    brainfuckOutput += '.';

    // Update the `currentPointerPosition` to reflect the new position.
    currentPointerPosition = nextPointerPosition;
  }

  // Output the final generated Brainfuck command sequence to the console.
  console.log(brainfuckOutput);
}
