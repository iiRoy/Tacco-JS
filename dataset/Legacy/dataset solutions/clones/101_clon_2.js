var fileSystem = require('fs');

// Obtain input from standard input stream
// Determine the size of the input data
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the raw input
var rawData = new Buffer(dataSize);

// Read the data from stdin into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, rawData, 0, dataSize, 0);

// Convert the buffer to a string, trim whitespace, and split into lines
var processedLines = rawData.toString('utf8', 0, readBytesCount).trim().split('\n');

// Begin the primary execution flow
executeProcessing();

/**
 * Processes pairs of input lines to calculate "hits" and "brows".
 * "Hits" are exact matches at the same position.
 * "Brows" are matches where an element from the first line exists anywhere in the second line.
 */
function executeProcessing() {
  // Iterate through the processed lines, taking two lines at a time
  for (var outerIdx = 0, totalLines = processedLines.length; outerIdx < totalLines; outerIdx += 2) {
    // Initialize counters for exact and partial matches for the current pair of lines
    var exactMatches = 0;
    var partialMatches = 0;

    // Split the current pair of lines by space after trimming
    var lineA = processedLines[outerIdx].trim().split(' ');
    var lineB = processedLines[outerIdx + 1].trim().split(' ');

    // Compare elements of lineA with lineB
    for (var innerIdxA = 0, lenLineA = lineA.length; innerIdxA < lenLineA; innerIdxA++) {
      // Check for an exact match at the same position
      if (lineA[innerIdxA] == lineB[innerIdxA]) {
        exactMatches++;
      }

      // Check for partial matches (element from lineA[innerIdxA] exists anywhere in lineB)
      for (var innerIdxB = 0, lenLineB = lineA.length; innerIdxB < lenLineB; innerIdxB++) {
        if (lineA[innerIdxA] == lineB[innerIdxB]) {
          partialMatches++;
        }
      }
    }
    // Output the calculated exact and partial matches for the current pair
    console.log(exactMatches, partialMatches);
  }
}
