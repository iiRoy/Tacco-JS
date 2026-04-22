// Define constants for success and failure messages.
const successMessage = 'YES';
const failureMessage = 'NO';

// Define a collection of acceptable numeric string values.
const allowedDigits = ['3', '5', '7'];

/**
 * Determines if a given input string represents one of the predefined "lucky" digits.
 * This script reads a single line from standard input, processes it, and prints
 * a corresponding message to standard output.
 * @returns {void}
 */
function processInputAndDetermineLuck() {
  // Obtain the raw input from the standard input stream.
  // The 'fs' (file system) module is used here to read from '/dev/stdin',
  // which is a common way to access standard input in Unix-like systems.
  // The 'utf8' encoding ensures proper character handling.
  const fileSystemModule = require('fs');
  const rawInputString = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  // Perform initial data sanitation: remove leading/trailing whitespace.
  // This ensures that inputs like " 3 " are treated identically to "3".
  const processedInput = rawInputString.trim();

  // A boolean flag to store the result of the validation.
  let isLuckyNumber = false;

  // Check if the processed input matches any of the allowed digits.
  // The Array.prototype.includes() method provides a concise way
  // to perform this membership test.
  if (allowedDigits.includes(processedInput)) {
    isLuckyNumber = true;
  }
  // The 'else' block is implicitly handled by 'isLuckyNumber' remaining false.

  // Output the appropriate message based on the validation result.
  // A ternary operator offers a compact way to choose between the two messages.
  const finalOutput = isLuckyNumber ? successMessage : failureMessage;
  console.log(finalOutput);
}

// Execute the main processing function.
processInputAndDetermineLuck();