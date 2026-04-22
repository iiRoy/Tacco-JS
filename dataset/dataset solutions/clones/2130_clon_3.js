// This module handles the computation of the number of digits
// required to represent a given decimal number in a specified base.
function CalculateBaseDigits(rawInputData) {
  // Defensive programming: Ensure valid input type and content.
  if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
    // Output an error message to the console if input is invalid.
    console.error("Error: Input data must be a non-empty string for processing.");
    return; // Terminate execution gracefully.
  }

  // Tokenize the raw input string by splitting it based on one or more whitespace characters.
  // This robustly handles cases with multiple spaces or leading/trailing spaces.
  const inputTokens = rawInputData.trim().split(/\s+/);

  // Validate that we received the expected number of tokens (two numeric parameters).
  if (inputTokens.length < 2) {
    console.error("Error: Two numeric parameters (a number and a base) are required for computation.");
    return;
  }

  // Extract and parse the first token as the decimal number to be converted.
  const numberAsString = inputTokens[0];
  let decimalNumber = parseInt(numberAsString, 10); // Explicitly parse as base-10 integer.

  // Extract and parse the second token as the target conversion base (radix).
  const radixAsString = inputTokens[1];
  let conversionRadix = parseInt(radixAsString, 10); // Explicitly parse as base-10 integer.

  // Perform validation on the parsed numeric inputs.
  // Check if either value resulted in NaN (Not-a-Number) after parsing.
  if (isNaN(decimalNumber) || isNaN(conversionRadix)) {
    console.error("Error: Invalid numeric input detected. Please ensure both provided values are valid integers.");
    return;
  }

  // Apply a crucial validation for the conversion base.
  // A valid base for number systems must typically be an integer 2 or greater.
  // Bases less than 2 would lead to logical errors or infinite loops in this algorithm.
  if (conversionRadix < 2) {
    console.error("Error: The conversion base (radix) must be an integer value of 2 or greater.");
    return;
  }

  // Handle the special case where the initial decimal number is zero.
  // In any valid base system, the number zero is represented by a single digit '0'.
  if (decimalNumber === 0) {
    console.log(1); // Output 1, as '0' has a length of one digit.
    return;
  }

  // Initialize a counter to keep track of the total number of digits.
  // This approach avoids building an intermediate string, which is a key Type III change.
  let totalDigitsComputed = 0;

  // Use a temporary variable for iterative calculations to preserve the original `decimalNumber`.
  let currentWorkingValue = decimalNumber;

  // Begin the iterative process to determine the number of digits in the target base.
  // The loop continues as long as the current working value is positive.
  while (currentWorkingValue > 0) {
    // Increment the digit counter for each successful division, indicating one digit found.
    totalDigitsComputed++;

    // Perform integer division to reduce the number for the next iteration.
    // Math.trunc ensures that any fractional part is discarded, yielding a whole number result.
    currentWorkingValue = Math.trunc(currentWorkingValue / conversionRadix);
  }

  // Output the final computed count of digits to the console.
  console.log(totalDigitsComputed);
}

// --- Standard Input/Output Handling Block ---
// This Immediately-Invoked Function Expression (IIFE) encapsulates
// the logic for reading from standard input and invoking the main processing function.
// It ensures separation of concerns and prevents global scope pollution.
(function setupStandardIO() {
  // Dynamically import the Node.js 'fs' (file system) module.
  const fileSystemModule = require("fs");
  // Define the standard input stream path, common in Unix-like environments.
  const standardInputPath = "/dev/stdin";
  // Specify the character encoding for reading the input file.
  const fileEncoding = "utf8";

  // Read the entire content from the standard input file synchronously.
  // While asynchronous reading is generally preferred for I/O, synchronous
  // reading is often used in competitive programming for simplicity.
  const receivedData = fileSystemModule.readFileSync(standardInputPath, fileEncoding);

  // Pass the raw data obtained from standard input to our primary calculation function.
  CalculateBaseDigits(receivedData);
})();