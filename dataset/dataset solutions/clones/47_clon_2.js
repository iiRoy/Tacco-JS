var fileSystem = require('fs'); // Import the Node.js file system module

// Determine the total byte length of the standard input stream
var dataLength = fileSystem.fstatSync(process.stdin.fd).size;

// Create a new Buffer to hold the incoming data
var dataBuffer = new Buffer(dataLength);

// Read the entire content from standard input into the allocated buffer
var readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataLength, 0);

// Convert the buffer content to a UTF-8 string and then split it into an array of lines
var inputLines = dataBuffer.toString('utf8', 0, readBytes).split('\n');

// Invoke the primary function to begin processing the input
processInput();

/**
 * This function orchestrates the main logic for processing the input data.
 * It reads configuration, initializes a permutation array, applies swap operations,
 * and then prints the final state of the array.
 */
function processInput() {
  // Parse the first line of input to get the 'width' parameter
  var widthValue = parseInt(inputLines[0], 10);

  // Parse the second line of input to get the 'number of operations' parameter
  var numOperations = parseInt(inputLines[1], 10);

  // Initialize an Int8Array to represent the permutation.
  // Int8Array is used for memory efficiency as values are small integers.
  var permutationArray = new Int8Array(widthValue);

  // Populate the permutation array with an initial identity mapping.
  // Each element at index 'counter' initially holds the value 'counter'.
  for (var counter = 0, arrayLength = permutationArray.length; counter < arrayLength; counter++) {
    permutationArray[counter] = counter;
  }

  // Iterate through the input lines, starting from the third line (index 2),
  // to apply each specified swap operation.
  for (var counter = 2; counter < numOperations + 2; counter++) {
    // Split the current line by a comma to extract the two indices for the swap
    var coords = inputLines[counter].split(",");

    // Parse the first coordinate as the 'source' index, adjusting for 0-based indexing
    var sourceIndex = parseInt(coords[0], 10) - 1;

    // Parse the second coordinate as the 'target' index, adjusting for 0-based indexing
    var targetIndex = parseInt(coords[1], 10) - 1;

    // Perform an XOR swap operation to exchange the values at sourceIndex and targetIndex.
    // This is a bitwise trick to swap two numbers without needing a temporary variable.
    permutationArray[sourceIndex] ^= permutationArray[targetIndex];
    permutationArray[targetIndex] ^= permutationArray[sourceIndex];
    permutationArray[sourceIndex] ^= permutationArray[targetIndex];
  }

  // After all swap operations are applied, print the final state of the permutation array.
  // Each value is incremented by 1 before printing to match 1-based output requirements.
  for (var counter = 0; counter < arrayLength; counter++) {
    console.log(permutationArray[counter] + 1);
  }
}
