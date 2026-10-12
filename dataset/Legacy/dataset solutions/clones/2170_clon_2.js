"use strict";

// This script processes input data from standard input.
processData(
  require("fs") // Utilize the Node.js file system module.
    .readFileSync("/dev/stdin", "UTF-8") // Read the entire content of standard input as a UTF-8 string.
    .trim() // Remove leading/trailing whitespace from the input string.
    .split("\n") // Split the string into an array of lines based on newline characters.
);

/**
 * Main function to handle the processed input.
 * @param {string[]} dataLines - An array of strings, where each string is a line from the input.
 */
function processData(dataLines) {
  // Output a string consisting of 'x' characters,
  // repeated as many times as the length of the first input line.
  console.log("x".repeat(dataLines[0].length));
}
