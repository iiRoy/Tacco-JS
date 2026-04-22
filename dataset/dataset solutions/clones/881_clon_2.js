/*
 * Program developed by an anonymous author.
 * Date of creation: 2013-10-06.
 */

// Acquire the necessary module for file system operations.
var diskOps = require('fs'),
    // Determine the total size of data from standard input.
    dataLength = diskOps.fstatSync(process.stdin.fd).size,
    // Allocate a memory block to store the input bytes.
    rawBytes = new Buffer(dataLength),
    // Read the actual data from standard input into the buffer.
    numBytesAcquired = diskOps.readSync(process.stdin.fd, rawBytes, 0, dataLength, 0),
    // Convert the raw bytes to a UTF-8 string and split it into individual lines.
    sourceInput = rawBytes.toString('utf8', 0, numBytesAcquired).split('\n');

// Initiate the primary execution sequence.
primaryRoutine();

/**
 * Generates a string by repeating a specified character a given number of times.
 * @param {number} repetitions - The total number of times the character should be repeated.
 * @param {string} symbol - The character to be repeated.
 * @returns {string} The resulting string sequence.
 */
function generateSequence(repetitions, symbol) {
  var loopCounter; // Loop control variable.
  var outputSequence = ''; // Accumulator for the resulting string.

  for (loopCounter = repetitions; loopCounter > 0; loopCounter--) {
    outputSequence += symbol; // Append the character in each iteration.
  }

  return outputSequence; // Return the final generated sequence.
}

/**
 * This is the core function of the application, responsible for processing
 * the input and generating the Brainfuck-like output.
 */
function primaryRoutine() {
  // Extract the first line of the source input.
  var sourceText = sourceInput[0],
      // Obtain the total character count of the input string.
      totalChars = sourceText.length,
      // Initialize the Brainfuck output string with a predefined preamble.
      bfCode = '>++++++[<+++++>-]<[>+>+>+>++>++>++>+++>+++>+++>++++<<<<<<<<<<-]>',
      // Declare variables for loop indexing, value differences, and temporary characters.
      charIndex, loopCounterJ, valueDifference, tempSquare, anotherTempSquare,
      // Variable to hold either '+' or '-' for BF operations.
      signSymbol = '',
      // Array storing the last known ASCII values for each Brainfuck cell.
      lastKnownValues = [30, 30, 30, 60, 60, 60, 90, 90, 90, 120],
      // Current active Brainfuck cell pointer position.
      headPosition = 0,
      // The target Brainfuck cell pointer position.
      destinationPosition,
      // An arbitrary constant, not actively used in the main loop logic.
      ARBITRARY_CONSTANT = 9,
      // Variable to store the ASCII code of the current character.
      glyphCode;

  // Iterate through each character of the input string.
  for (charIndex = 0; charIndex < totalChars; charIndex++) {
    glyphCode = sourceText.charCodeAt(charIndex); // Retrieve the ASCII value of the current character.
    // Calculate the target cell index based on the character's ASCII value.
    destinationPosition = Math.floor((glyphCode - 33) / 11);

    // console.log("Current character code:", glyphCode, "Target cell:", destinationPosition); // Debugging output, currently commented.

    // Append commands to move the Brainfuck pointer to the target cell.
    bfCode += generateSequence(Math.abs(headPosition - destinationPosition), headPosition < destinationPosition ? '>' : '<');

    // Determine the difference between the current character's code and the stored cell value.
    valueDifference = glyphCode - lastKnownValues[destinationPosition];
    // Set the operator symbol based on whether the difference is positive or negative.
    signSymbol = valueDifference > 0 ? '+' : '-';
    // Use the absolute value of the difference for character repetition.
    valueDifference = Math.abs(valueDifference);

    // console.log("Cell values:", lastKnownValues, "Value difference:", valueDifference, "Target cell:", destinationPosition); // Another debugging line.

    // Append commands to adjust the value of the target Brainfuck cell.
    bfCode += generateSequence(valueDifference, signSymbol);
    // Update the last known value for the current target cell.
    lastKnownValues[destinationPosition] = glyphCode;
    // Append the Brainfuck output command ('.').
    bfCode += '.';
    // Update the current head position to the target cell.
    headPosition = destinationPosition;
  }

  // Print the final generated Brainfuck code to the console.
  console.log(bfCode);
}