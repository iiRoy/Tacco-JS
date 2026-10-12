"use strict";

// Resume standard input stream processing
process.stdin.resume();
// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding("utf-8");

/**
 * Outputs a given value to the console.
 * @param {any} outputVal - The value to be displayed.
 */
function displayResult(outputVal) {
  console.log(outputVal);
}

// Buffer to accumulate all incoming standard input data
let rawDataBuffer = "";
// Index to keep track of the current line being processed from the input
let lineIndex = 0;

// Event listener for incoming data chunks
process.stdin.on("data", chunkOfData => {
  rawDataBuffer += chunkOfData; // Append new data to the buffer
});

// Event listener for the end of the input stream
process.stdin.on("end", () => {
  // Split the accumulated buffer into an array of lines
  rawDataBuffer = rawDataBuffer.split("\n");
  // Execute the primary application logic
  executePrimaryLogic();
});

/**
 * Retrieves the next line from the buffered input.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
  return rawDataBuffer[lineIndex++]; // Return current line and increment index
}

// --- End of boilerplate input handling ---

/**
 * Main function containing the core logic of the program.
 * Reads two numbers, performs calculations, and prints the result.
 */
function executePrimaryLogic() {
  // Read a line, split by space, and convert parts to integers
  var inputNumbersArray = fetchNextLine().split(" ").map(strNum => parseInt(strNum));
  // Assign the two numbers to distinct variables
  var firstNum = inputNumbersArray[0], secondNum = inputNumbersArray[1];

  // Determine the larger and smaller of the two numbers
  var largerValue = Math.max(firstNum, secondNum);
  var smallerValue = Math.min(firstNum, secondNum);

  // Calculate integer division of the larger by the smaller
  var quotientResult = Math.floor(largerValue / smallerValue);
  // Calculate integer product of the two numbers
  var productResult = Math.floor(largerValue * smallerValue);
  // Perform the final calculation: product divided by quotient
  var finalCalculation = Math.floor(productResult / quotientResult);

  // Output the final computed value
  displayResult(finalCalculation);
}
