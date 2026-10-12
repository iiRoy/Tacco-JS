const fileSystem = require("fs"); // Import the file system module for file operations.

// Read the entire content from standard input, assuming UTF-8 encoding.
let rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the raw input by newline characters and take the very first line.
// This line is expected to contain the numerical value.
let firstLineValue = rawData.split(/\n/)[0];

// Calculate the cube of the numerical value obtained from the first line.
// JavaScript's multiplication operator will implicitly convert the string to a number.
let cubedResult = firstLineValue * firstLineValue * firstLineValue;

// Output the calculated cube followed by a newline character to the console.
console.log(cubedResult + "\n");
