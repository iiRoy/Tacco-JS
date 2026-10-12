var fileSystemModule = require('fs');

var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(dataLength);
var bytesProcessed = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataLength, 0);
var rawInputLines = dataBuffer.toString('utf8', 0, bytesProcessed).split('\n');

// Initiate the primary processing function
processInputData();

// Main logic for handling input data
function processInputData() {
  // Iterate through each data set provided in the input
  for (let currentLineIndex = 1, totalDataSets = Number(rawInputLines[0]); currentLineIndex <= totalDataSets; currentLineIndex++) {
    // Parse the numbers from the current line and sort them in ascending order
    let parsedNumbers = rawInputLines[currentLineIndex].split(" ").sort(function(valA, valB) {
      return valA - valB;
    });

    // Assign sorted values to descriptive variables for clarity
    let hypotenuseCandidate = parsedNumbers[2]; // The largest number
    let sideB = parsedNumbers[1];             // The middle number
    let sideA = parsedNumbers[0];             // The smallest number

    // Check if the numbers form a Pythagorean triplet (a^2 + b^2 = c^2)
    // and print 'YES' or 'NO' accordingly.
    console.log((hypotenuseCandidate * hypotenuseCandidate === sideB * sideB + sideA * sideA) ? 'YES' : 'NO');
  }
}
