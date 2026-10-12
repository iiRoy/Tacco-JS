const fileSystem = require('fs'); // Import the file system module for I/O operations.

// Determine the total byte size of the incoming standard input stream.
let fileSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a new buffer to store the raw data read from standard input.
let dataBuffer = Buffer.alloc(fileSize);

// Read the content from standard input into the allocated buffer.
let actualBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer's content to a UTF-8 string, remove leading/trailing whitespace,
// and then split the string into an array of individual lines based on newline characters.
let linesOfInput = dataBuffer.toString('utf8', 0, actualBytes).trim().split('\n');

// Initiate the primary data processing routine.
processGameData();

/**
 * This function iterates through each line of input, processes it as a set of card values,
 * and determines if a specific card pattern ("four card") is present.
 */
function processGameData() {
  // Loop through every entry in the array of input lines.
  for (let idx = 0, totalLines = linesOfInput.length; idx < totalLines; idx++) {
    // For each line:
    // 1. Remove any surrounding whitespace.
    // 2. Split the string by commas to get individual card value strings.
    // 3. Sort these values in descending numerical order.
    // 4. Convert the sorted string values into actual numbers.
    let cardValues = linesOfInput[idx].trim().split(',').sort(function(valA, valB) {
      // Custom comparison function for numeric descending sort.
      return valB - valA;
    }).map(Number);

    // Initialize a default message for the outcome.
    let outcomeMessage = "null";

    // Check for the "four card" condition:
    // This occurs if either the first four sorted values are identical,
    // or the last four sorted values (from the second to the fifth) are identical.
    if ((cardValues[0] === cardValues[1] && cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3]) ||
      (cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3] && cardValues[3] === cardValues[4])
    ) {
      outcomeMessage = "four card"; // Update the message if the pattern is found.
    }

    // Print the determined outcome message to the console for the current input line.
    console.log(outcomeMessage);
  }
}
