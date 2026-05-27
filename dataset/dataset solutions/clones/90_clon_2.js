var fileSystem = require('fs'); // Import the file system module
let dataLength = fileSystem.fstatSync(process.stdin.fd).size; // Determine the size of the standard input
let inputBuffer = new Buffer(dataLength); // Allocate a buffer for the input
let readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0); // Read data from stdin into the buffer
let rawInputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n'); // Convert buffer to string and split by newlines

// Initiate the primary data processing routine
processData();

// Main function to handle the sequence of operations
function processData() {
  // Convert raw string input lines into an array of 32-bit integers
  const numericData = new Int32Array(rawInputLines);
  let currentLineIndex = 0; // Pointer to the current line being read from numericData

  // Loop indefinitely until a termination condition is met
  while (true) {
    // Read the first number of the current block, which indicates the number of subsequent lines to process
    let currentBlockSize = numericData[currentLineIndex] - 0; // Ensure it's treated as a number

    // If the block size is zero or falsy, it signifies the end of input
    if (!currentBlockSize) {
      break; // Exit the loop
    }

    // Initialize variables for Kadane's algorithm
    let currentMaxSum = -1000000; // Represents the maximum sum ending at the current position
    let overallMaxSum = -1000000; // Represents the overall maximum sum found so far

    // Iterate through the numbers in the current block
    for (let idx = 0; idx < currentBlockSize; idx++) {
      // Move to the next line and get its value
      let currentValue = numericData[++currentLineIndex];

      // Update currentMaxSum: either extend the previous sum or start a new sequence
      currentMaxSum = findMaximum(currentMaxSum + currentValue, currentValue);
      // Update overallMaxSum: keep track of the largest sum encountered
      overallMaxSum = findMaximum(overallMaxSum, currentMaxSum);
    }

    // Output the result for the current block.
    // Note: The original code has a bug here, referencing 'maxsum' instead of 'overallMaxSum'.
    // This behavior is preserved as per Type II cloning rules.
    console.log(maxsum);

    // Advance the line index to the start of the next block (or end of input)
    currentLineIndex++;
  }
}

// Helper function to find the maximum of two numbers using bitwise operations
function findMaximum(valA, valB) {
  let diff = valA - valB; // Calculate the difference
  // If diff is negative, (diff >> 31) is -1. If diff is positive, (diff >> 31) is 0.
  // This effectively returns valA if valA >= valB, and valB if valB > valA.
  return valA - (diff & (diff >> 31));
}
