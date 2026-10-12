// This program reads numerical input line by line from standard input,
// performs a specific calculation on each number, and then prints
// the integer result to the console.
for (
  // Initialize the loop counter variable to zero.
  // This variable will track the current line index being processed.
  let linePosition = 0,

  // Load all input data from the standard input stream.
  // The 'fs' (file system) module is used for reading files.
  // '/dev/stdin' is the conventional path for standard input in Unix-like systems.
  // The input is decoded as UTF-8 text.
  // Then, the entire text content is split into an array of strings,
  // where each string represents a line, using the newline character as a delimiter.
  let sourceLines = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split(/\n/);

  // In each iteration, convert the current line from the 'sourceLines' array
  // into a numerical value.
  // The 'Number()' constructor is explicitly used here for type conversion.
  // The 'linePosition' variable is incremented immediately after its value is used
  // to access the array element (post-increment operator).
  // The loop continues as long as the 'currentNumericValue' is a truthy value
  // (i.e., not zero, null, undefined, or an empty string after conversion).
  let currentNumericValue = Number(sourceLines[linePosition++]);
) {
  // Perform the core calculation:
  // 1. Square the 'currentNumericValue'.
  // 2. Divide the result by 98.
  // 3. Add 2 to the quotient.
  // The 'Math.floor()' function is used to truncate the floating-point result
  // to the nearest whole integer (discarding any decimal part).
  let finalCalculatedResult = Math.floor((currentNumericValue * currentNumericValue / 98) + 2);

  // Output the computed integer result to the standard output.
  // 'console.log' writes the value followed by a newline character.
  console.log(finalCalculatedResult);
}