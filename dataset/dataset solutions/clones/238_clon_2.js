var fs = require('fs'); // File system module for input operations

// Determine the size of the standard input stream
var dataSize = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fs.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert buffer to string, trim whitespace, and split into an array of lines
var linesOfText = inputBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Execute the primary processing function
processInputData();

function processInputData() {
  // Iterate through each line of the input
  for (var idx = 0, totalLines = linesOfText.length; idx < totalLines; idx++) {
    // Parse the current line into an array of numbers
    var coordsArray = linesOfText[idx].split(' ').map(Number);

    // Extract coordinates for the first rectangle (Rectangle A)
    var rectA_x1 = coordsArray[0];
    var rectA_y1 = coordsArray[1];
    var rectA_x2 = coordsArray[2];
    var rectA_y2 = coordsArray[3];

    // Extract coordinates for the second rectangle (Rectangle B)
    var rectB_x1 = coordsArray[4];
    var rectB_y1 = coordsArray[5];
    var rectB_x2 = coordsArray[6];
    var rectB_y2 = coordsArray[7];

    // Check for overlap between the two rectangles
    // Overlap occurs if they overlap on both X and Y axes
    var overlapDetected = (rectA_x1 <= rectB_x2 && rectB_x1 <= rectA_x2) &&
                          (rectA_y1 <= rectB_y2 && rectB_y1 <= rectA_y2);

    // Output 'YES' if overlap is detected, otherwise 'NO'
    console.log(overlapDetected ? 'YES' : 'NO');
  }
}
