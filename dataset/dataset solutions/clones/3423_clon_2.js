"use strict"; // Enforce strict mode for cleaner code

// Read input from standard input, convert it to a number, and remove leading/trailing whitespace.
const numVal = Number(require("fs").readFileSync("/dev/stdin", "UTF-8").trim());

// Check if the processed numeric value is one of the specific prime numbers.
if (numVal === 3 || numVal === 5 || numVal === 7) {
  // If it matches, print "YES" to the console.
  console.log("YES");
} else {
  // Otherwise, print "NO".
  console.log("NO");
}
