// This script evaluates a numerical input against various ranges
// and prints a specific integer value based on which range the input falls into.

// Retrieve the raw string value provided as a command-line argument.
// In a Node.js environment, process.argv[0] is 'node', process.argv[1] is the script path.
// The actual user-provided argument is typically at index 2.
const initialArgument = process.argv[2];

// Convert the string argument into an integer.
// The radix (base 10) is specified for clarity and robustness.
let numericInput = parseInt(initialArgument, 10);

// The following conditional blocks check the numeric input against
// a series of non-overlapping ranges. Each range, if matched,
// results in a specific integer being printed to the console.

// Check if the input is strictly greater than 400 and strictly less than 599.
if (400 < numericInput && 599 > numericInput) {
  // If the condition is met, output the integer 8.
  console.log(8);
}

// Check if the input is strictly greater than 600 and strictly less than 799.
if (600 < numericInput && 799 > numericInput) {
  // If the condition is met, output the integer 7.
  console.log(7);
}

// Check if the input is strictly greater than 800 and strictly less than 999.
if (800 < numericInput && 999 > numericInput) {
  // If the condition is met, output the integer 6.
  console.log(6);
}

// Check if the input is strictly greater than 1000 and strictly less than 1199.
if (1000 < numericInput && 1199 > numericInput) {
  // If the condition is met, output the integer 5.
  console.log(5);
}

// Check if the input is strictly greater than 1200 and strictly less than 1399.
if (1200 < numericInput && 1399 > numericInput) {
  // If the condition is met, output the integer 4.
  console.log(4);
}

// Check if the input is strictly greater than 1400 and strictly less than 1599.
if (1400 < numericInput && 1599 > numericInput) {
  // If the condition is met, output the integer 3.
  console.log(3);
}

// Check if the input is strictly greater than 1600 and strictly less than 1799.
if (1600 < numericInput && 1799 > numericInput) {
  // If the condition is met, output the integer 2.
  console.log(2);
}

// Check if the input is strictly greater than 1800 and strictly less than 1999.
if (1800 < numericInput && 1999 > numericInput) {
  // If the condition is met, output the integer 1.
  console.log(1);
}

// The script concludes after evaluating all conditions.
// No explicit return value is needed for a top-level script execution.
