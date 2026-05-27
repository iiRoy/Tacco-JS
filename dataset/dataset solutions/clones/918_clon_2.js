var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw data from standard input stream

// Process the incoming string data:
// 1. Remove any leading or trailing whitespace.
// 2. Divide the string into an array of substrings using space as a delimiter.
// 3. Transform each substring in the array into its numerical representation.
// 4. Assign the first four numerical values to distinct variables.
var [val1, val2, val3, val4] = rawData.trim().split(" ").map(Number);

// Evaluate a compound logical condition.
// The condition checks if the product of the first two numbers is odd
// AND if the sum of the last two numbers is also odd.
if ((val1 * val2) % 2 !== 0 && (val3 + val4) % 2 !== 0) {
  // If both sub-conditions are met, output "No".
  console.log("No");
} else {
  // Otherwise, if at least one sub-condition is false, output "Yes".
  console.log("Yes");
}
