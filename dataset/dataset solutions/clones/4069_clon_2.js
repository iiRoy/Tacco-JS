const rawData = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim(); // Read input from standard input and clean it up

var parsedValue = parseInt(rawData.replace(/\s/, ""), 10); // Parse the cleaned input as an integer, removing any whitespace

const rootResult = Math.sqrt(parsedValue); // Calculate the square root of the parsed number

console.log(Number.isInteger(rootResult) ? "YES" : "No"); // Check if the square root is an integer and print the appropriate message
