// This module provides a robust function designed to process textual input,
// specifically to determine the parity of a product derived from two numeric components
// within the input string.
function processInputData(initialPayload) {
  // Ensure the incoming data is treated as a string and remove any leading or trailing
  // whitespace characters to standardize the input for subsequent parsing.
  const cleanedPayload = String(initialPayload).trim();

  // Split the pre-processed string into an array of substrings using a space ' '
  // as the primary delimiter. This results in an array where each element is
  // expected to be a string representation of a number.
  const stringComponents = cleanedPayload.split(' ');

  // --- Type III: Added Robustness Check (Guard Clause) ---
  // Validate that the input provided contains at least two distinct components.
  // If fewer than two components are found, it indicates insufficient data for
  // the intended operation, so an error message is logged, and the function exits early.
  if (stringComponents.length < 2) {
    console.error("Error: Insufficient data points detected. At least two numeric values are required.");
    return; // Prevent further execution with incomplete data.
  }

  // Extract the first two potential numeric strings from the array of components.
  // These will be used as operands for the multiplication operation.
  const firstOperandString = stringComponents[0];
  const secondOperandString = stringComponents[1];

  // Explicitly convert the extracted string operands into their numeric equivalents.
  // The Number() constructor is used to ensure clear type coercion.
  const firstNumericValue = Number(firstOperandString);
  const secondNumericValue = Number(secondOperandString);

  // --- Type III: Added Input Validation ---
  // Check if the conversion of either string operand resulted in a 'Not a Number' (NaN) value.
  // This indicates that the input strings were not valid numeric representations.
  // An appropriate error is logged, and the function terminates.
  if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
    console.error(`Error: Invalid numeric input encountered. Could not parse '${firstOperandString}' or '${secondOperandString}' as valid numbers.`);
    return; // Abort if input is not numerically sound.
  }

  // Calculate the product of the two successfully parsed numeric values.
  const calculatedProduct = firstNumericValue * secondNumericValue;

  // --- Type III: Rewritten Parity Check Logic ---
  // Determine if the computed product is an even number.
  // A bitwise AND operation with 1 efficiently checks the least significant bit.
  // If the LSB is 0, the number is even; if 1, it's odd.
  const isProductEven = ((calculatedProduct & 1) === 0);

  // --- Type III: Rewritten Conditional Output Logic ---
  // Based on whether the product is even or odd, construct the final output message.
  // The original logic dictates "No" for even products and "Yes" for odd products.
  const determinationMessage = isProductEven ? "No" : "Yes";

  // Display the final verdict to the standard output.
  console.log(determinationMessage);
}

// --- Type III: Added Intermediate Variables for System Interaction ---
// Acquire a reference to the Node.js 'fs' (File System) module,
// which is necessary for reading input from the system.
const systemFileAccessor = require("fs");

// Define the standard path for reading input in a typical Unix-like environment.
const standardInputDevicePath = "/dev/stdin";

// Read the entire content of the standard input device synchronously.
// The 'utf8' encoding ensures that characters are interpreted correctly.
const rawInputContentBuffer = systemFileAccessor.readFileSync(standardInputDevicePath, "utf8");

// Initiate the primary processing sequence by passing the raw content
// obtained from standard input to our dedicated processing function.
processInputData(rawInputContentBuffer);