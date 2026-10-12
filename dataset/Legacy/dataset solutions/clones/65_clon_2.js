var fileSystem = require('fs'); // Import the file system module

// Determine the size of the standard input stream
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var dataBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, trim whitespace, and split into lines
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

// Execute the primary processing function
processCoordinates();

// Main function to calculate final coordinates
function processCoordinates() {
  // Initialize current X and Y coordinates
  var currentX = 0, currentY = 0;
  // Initialize the cumulative angle
  var totalAngle = 0;

  // Iterate through each line of input
  for (var lineIndex = 0, totalLines = inputLines.length; lineIndex < totalLines; lineIndex++) {
    // Split the current line by comma to get radius and angle change
    var lineParts = inputLines[lineIndex].split(',');
    
    // Parse radius and angle change as numbers
    var radiusVal = lineParts[0] - 0; // Convert string to number
    var angleChange = lineParts[1] - 0; // Convert string to number

    // If both radius and angle change are zero, terminate processing
    if (!radiusVal && !angleChange) {
      break;
    }

    // Update X coordinate based on current radius and total angle
    currentX += radiusVal * Math.sin(totalAngle * Math.PI / 180);
    // Update Y coordinate based on current radius and total angle
    currentY += radiusVal * Math.cos(totalAngle * Math.PI / 180);

    // Accumulate the angle change
    totalAngle += angleChange;
  }

  // Output the floored X coordinate
  console.log(~~currentX);
  // Output the floored Y coordinate
  console.log(~~currentY);
}
