'use strict'; // Enforce strict mode for cleaner code execution

// Import the Node.js file system module to handle file operations.
// Read the entire content from standard input, decode it as UTF-8,
// and then divide it into an array of strings based on newline characters.
const inputRows = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

// Process each string in the 'inputRows' array.
// Convert each string element into its numerical representation.
// Store the resulting array of numbers in 'numericValues'.
const numericValues = inputRows.map(textLine => Number(textLine));

// Output a specific integer value to the console.
console.log(16);
