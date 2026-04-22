const moduleLoader = require('fs'); // Obtains the built-in file system module for I/O operations.

let sourceText = moduleLoader.readFileSync('/dev/stdin', 'utf8'); // Reads all content from the standard input stream as UTF-8 encoded text.

// Cleans the raw input by removing leading/trailing whitespace and then segments it
// into an array of strings, using newline characters as delimiters.
let parsedSegments = (sourceText.trim()).split("\n");

// Initializes the running total for calculations with the first numeric value
// from the parsed input segments, ensuring it's treated as a number.
let runningTotal = Number(parsedSegments[0]);

// Iterates through the segments, beginning from the second element (index 1).
// The loop increments by two to process an operator followed by an operand in each step.
for (let currentIdx = 1; currentIdx < parsedSegments.length; currentIdx += 2) {
  // Checks if the current segment is the termination operator.
  if (parsedSegments[currentIdx] === "=") {
    break; // Exits the loop if the equality sign is encountered, signaling the end of operations.
  }

  // Performs an arithmetic operation based on the identified operator.
  // The operand (next segment) is explicitly converted to a number.
  if (parsedSegments[currentIdx] === "+") {
    runningTotal += Number(parsedSegments[currentIdx + 1]); // Adds the subsequent numerical segment.
  } else if (parsedSegments[currentIdx] === "-") {
    runningTotal -= Number(parsedSegments[currentIdx + 1]); // Subtracts the subsequent numerical segment.
  } else if (parsedSegments[currentIdx] === "*") {
    runningTotal *= Number(parsedSegments[currentIdx + 1]); // Multiplies by the subsequent numerical segment.
  } else if (parsedSegments[currentIdx] === "/") {
    runningTotal /= Number(parsedSegments[currentIdx + 1]); // Divides by the subsequent numerical segment.
  }

  // Ensures that the running total remains an integer after each operation
  // by truncating any fractional part.
  runningTotal = Math.trunc(runningTotal);
}

console.log(runningTotal); // Prints the final calculated integer value to the console output.