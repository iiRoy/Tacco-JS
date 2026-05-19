var fileSystemModule = require('fs');

// Determine the size of the standard input stream
var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines
var parsedLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Parse the input values
// The first line contains 'n'
var limitVal = parsedLines[0] - 0; // Convert to number

// The second line contains 'a' and 'b' separated by a space
var valA = parsedLines[1].split(' ')[0];
var valB = parsedLines[1].split(' ')[1];

// The third line contains 'c' and 'd' separated by a space
var valC = parsedLines[2].split(' ')[0];
var valD = parsedLines[2].split(' ')[1];

// Declare variables for the loop and calculations
var iteratorVar;
var diffAB;
var diffCD;

// Initialize the minimum sum to a very large number
var minimumSum = Infinity;

// Iterate from 1 up to 'n' (inclusive)
for (iteratorVar = 1; iteratorVar <= limitVal; iteratorVar++) {
  // Calculate the "Manhattan distance" for (a, b) based on current iteratorVar
  diffAB = Math.abs(valA % iteratorVar - valB % iteratorVar) + Math.abs(~~(valA / iteratorVar) - ~~(valB / iteratorVar));

  // Calculate the "Manhattan distance" for (c, d) based on current iteratorVar
  diffCD = Math.abs(valC % iteratorVar - valD % iteratorVar) + Math.abs(~~(valC / iteratorVar) - ~~(valD / iteratorVar));

  // Update the minimum sum if the current total is smaller
  minimumSum = Math.min(minimumSum, diffAB + diffCD);
}

// Output the calculated minimum sum to the console
console.log(minimumSum);
