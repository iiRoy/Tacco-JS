// Acquire file system module for I/O operations
const fileSystemHandler = require('fs');

  // Determine the total byte count of the standard input stream
const streamByteCount = fileSystemHandler.fstatSync(process.stdin.fd).size;

    // Allocate a new buffer to hold the incoming data
const inputOctetBuffer = new Buffer(streamByteCount);

        // Read data from standard input into the buffer
const actualReadBytes = fileSystemHandler.readSync(
  process.stdin.fd,
  inputOctetBuffer,
  0,
  streamByteCount,
  0
);

  // Convert the buffer content to a UTF-8 string and split into individual lines
const rawInputLines = inputOctetBuffer.toString('utf8', 0, actualReadBytes).split('\n');

// Initiate the primary data processing routine
processInputData();
  
// This section contains the core logic for processing each input line
function processInputData() {
  // The first line of input specifies the total number of test cases
  const numberOfCases = parseInt(rawInputLines[0], 10);

  // Iterate through each test case, starting from the second line of input
  for (let currentCaseIndex = 1; currentCaseIndex <= numberOfCases; currentCaseIndex++) {
    // Parse the current line, split by space, and sort numerically
    const parsedNumbers = rawInputLines[currentCaseIndex]
      .split(" ")
      .map(Number) // Explicitly convert to number
      .sort(function(valA, valB) {
        return valA - valB;
      });

    // Assign sorted values to descriptive variables
    const largestSide = parsedNumbers[2];
    const midSide = parsedNumbers[1];
    const smallestSide = parsedNumbers[0];
 
    // Check if the sides form a right-angled triangle using the Pythagorean theorem
    // Output 'YES' if it is, 'NO' otherwise
    console.log(
      (largestSide * largestSide === midSide * midSide + smallestSide * smallestSide)
        ? 'YES'
        : 'NO'
    );
  }
}