/*
 * This script processes numerical input from standard input.
 * It reads a line, parses four numbers, and then applies a specific
 * conditional check based on the first two numbers.
 */

// Import the Node.js file system module to read from stdin.
const fileSystem = require('fs');

// Read the entire content from standard input, decode it as UTF-8.
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim leading/trailing whitespace, split the string by spaces,
// and convert each resulting part into a number.
// Destructure the first four numbers into distinct variables.
let [valA, valB, valC, valD] = rawData.trim().split(" ").map(Number);

// Evaluate a complex condition involving valA and valB.
// The condition checks if (valA + valB + 1) is an even number
// AND if (valA * valB + 1) is an odd number.
if (((valA + valB + 1) % 2 === 0) && ((valA * valB + 1) % 2 !== 0)) {
  // If the condition is true, print "No" to the console.
  console.log("No");
} else {
  // Otherwise (if the condition is false), print "Yes" to the console.
  console.log("Yes");
}
