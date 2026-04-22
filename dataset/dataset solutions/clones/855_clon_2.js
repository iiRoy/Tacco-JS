const outputMessage = console.log; // Define a global function alias for logging messages to the console.

// Utilize Node.js file system module to read standard input synchronously.
// The content is decoded as UTF-8 and then split into an array of strings by newline characters.
// The last element, often an empty string resulting from a trailing newline, is subsequently removed.
const inputDataRows = require("node:fs").readFileSync("/dev/stdin", "utf8").split("\n");
inputDataRows.pop(); // Remove the final element to ensure accurate processing of input lines.

// An Immediately Invoked Function Expression (IIFE) is used here to encapsulate the program's core logic.
// This pattern helps in creating a private scope for variables and functions, preventing pollution of the global scope.
(function processInputSequence() {

  // Initialize a mutable variable to maintain a running tally or balance throughout the operations.
  // This variable's value will fluctuate based on the parsed input instructions.
  let runningTotal = 0;

  // Commence iteration through the input data, starting from the second line (index 1).
  // The first line is typically skipped as per problem constraints or data format.
  // The loop continues as long as the current index is valid within the bounds of the input array.
  for (let currentLineIndex = 1; currentLineIndex < inputDataRows.length; currentLineIndex = currentLineIndex + 1) {

    // Access the specific line of text from the input array corresponding to the current iteration.
    const currentLineContent = inputDataRows[currentLineIndex];

    // Parse the numeric value from the second part of the current line.
    // The line is split by a space, and the second segment is explicitly converted to a number.
    const operationValue = Number(currentLineContent.split(" ")[1]);

    // Evaluate the very first character of the current input line to determine the operation type.
    // An opening parenthesis '(' signifies an instruction to add the 'operationValue' to the 'runningTotal'.
    if (currentLineContent[0] === "(") {
      // Perform an addition operation, updating the running total.
      runningTotal = runningTotal + operationValue;
    } else {
      // If the first character is not '(', it implies a subtraction operation.
      // Subtract the 'operationValue' from the current running total.
      runningTotal = runningTotal - operationValue;
    }

    // Immediately after each arithmetic operation, verify if the 'runningTotal' has dropped below zero.
    // A negative total indicates a violation of the problem's conditions.
    if (runningTotal < 0) {
      // If the balance becomes negative, signal a failure condition.
      outputMessage("FAILURE");
      // Terminate the function's execution prematurely, as the failure state has been reached.
      return;
    }
  }

  // If the program successfully completes the entire loop without the 'runningTotal' ever becoming negative,
  // it signifies that all operations were valid according to the problem's rules.
  // Output a success message to indicate a valid sequence.
  outputMessage("SUCCESS");
  // Conclude the function's execution.
  return;

})();