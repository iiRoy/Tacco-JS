/*
 * This module processes input lines to determine the day of the week for specific dates in 2004.
 * It reads data from standard input, parses each line, and outputs the corresponding day name.
 */
var fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the total byte count of the standard input stream.
var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a new buffer to hold the incoming data.
var dataBuffer = new Buffer(dataSize);

// Read the entire content from standard input into the buffer.
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, remove leading/trailing whitespace, and split into an array of lines.
var processedLines = dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

// Initiate the primary processing routine.
processEntries();

/**
 * Main function to iterate through processed input lines and calculate day names.
 */
function processEntries() {
  // Loop through each line obtained from the standard input.
  for (var idx = 0, totalLines = processedLines.length; idx < totalLines; idx++) {
    // Split the current line by space to get individual components (month and day).
    var currentParts = processedLines[idx].split(' ');

    // Check if both components can be converted to positive numbers (month and day are valid).
    if (+currentParts[1] && +currentParts[0]) {
      // Create a Date object for the year 2004, using the parsed month (0-indexed) and day.
      var targetDate = new Date(2004, +currentParts[0] - 1, +currentParts[1]);

      // An array mapping day indices (0-6) to their respective names.
      var dayNames = ['Sunday', 'Monday', 'Thuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      // Output the day name corresponding to the calculated date's day of the week.
      console.log(dayNames[targetDate.getDay()]);
    }
  }
}
