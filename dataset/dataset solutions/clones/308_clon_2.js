const inputVals = require ('fs')
  .readFileSync ('/dev/stdin', 'utf-8') // Read input from standard input as UTF-8
  .trim () // Remove leading/trailing whitespace
  .split (/\s/); // Split the string by any whitespace character into an array

let currentIdx = 0; // Initialize an index for array traversal

// Loop structure with an initial console log
for (
  console.log (
    Math.floor (
      inputVals [currentIdx++] * inputVals [currentIdx++] / 3.305785e-6
    ) /
    (1000 * 1000)
  ); // Perform calculation and print result using console.log
  currentIdx < inputVals.length - 1; // Continue loop as long as index is not at the last element
) {
  // Loop body is intentionally empty as all operations are in the initialization and condition
}