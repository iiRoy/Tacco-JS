// This script is designed to process numerical data provided via standard input.
var fs = require('fs'); // Import the Node.js file system module.

// Determine the total size of the incoming data from standard input.
var dataSize = fs.fstatSync(process.stdin.fd).size;

// Create a temporary buffer to hold the raw input bytes.
var tempBuffer = new Buffer(dataSize);

// Read the entire content from standard input into the buffer.
var readCount = fs.readSync(process.stdin.fd, tempBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, remove leading/trailing whitespace,
// and then split it into an array of individual lines.
var inputLines = tempBuffer.toString('utf8', 0, readCount).trim().split('\n');

// Initiate the primary data processing routine.
processInputData();

/**
 * Main function to iterate through each line of input and determine a specific card-like outcome.
 */
function processInputData() {
  // Loop through every line that was read from the input.
  for (var lineIndex = 0, totalLines = inputLines.length; lineIndex < totalLines; lineIndex++) {
    // For each line:
    // 1. Trim whitespace.
    // 2. Split the string by commas to get individual card values as strings.
    // 3. Sort these values in descending order (e.g., 10, 9, 8...).
    // 4. Convert the sorted string values into actual numbers.
    var cardValues = inputLines[lineIndex].trim().split(',').sort(function(valA, valB) {
      return valB - valA; // Custom sort for descending numeric order.
    }).map(Number); // Convert all elements to numbers.

    var outcomeString = "null"; // Initialize the result string to a default "null" state.

    // Check for "four card" condition:
    // Either the first four cards are identical, or the last four cards are identical.
    if ((cardValues[0] === cardValues[1] && cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3]) ||
      (cardValues[1] === cardValues[2] && cardValues[2] === cardValues[3] && cardValues[3] === cardValues[4])) {
      outcomeString = "four card";
    }
    // Otherwise, check for "full house" condition:
    // Either the first three are a kind and the last two are a kind,
    // or the first two are a kind and the last three are a kind.
    else if ((cardValues[0] === cardValues[1] && cardValues[1] === cardValues[2] && cardValues[3] === cardValues[4]) ||
      (cardValues[0] === cardValues[1] && cardValues[2] === cardValues[3] && cardValues[3] === cardValues[4])) {
      outcomeString = "full house";
    }
    // Otherwise, check for "straight" condition:
    // Cards are in sequential order (e.g., 5,4,3,2) AND
    // either it's a high straight (13,12,11,10,1 - Ace high) or a regular straight (e.g., 5,4,3,2,1).
    else if (cardValues[0] === cardValues[1] + 1 && cardValues[1] === cardValues[2] + 1 && cardValues[2] === cardValues[3] + 1 &&
      ((cardValues[0] === 13 && cardValues[4] === 1) || (cardValues[3] === cardValues[4] + 1))) {
      outcomeString = "straight";
    }

    // Print the determined outcome for the current line to the console.
    console.log(outcomeString);
  }
}
