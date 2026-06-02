var fileSystemModule = require('fs'); // Obtain the Node.js file system module

// Determine the total byte size of the standard input stream
var dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a new buffer to store the incoming data from stdin
var inputBuffer = new Buffer(dataSize);

// Read the entire content from standard input into the allocated buffer
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer's content to a UTF-8 string and then split it into an array of lines
var linesOfInput = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Execute an anonymous function immediately, passing a specific array as an argument
(function (digitMapping) {
  // Iterate over each individual line retrieved from the standard input
  linesOfInput.forEach(function (currentLine) {
    // Convert the current line to a number. If it's a non-zero number (truthy), proceed with processing.
    if (currentLine - 0) {
      console.log(
        (currentLine - 0) // Convert the string line to its numeric equivalent
        .toString(8)     // Transform the number into its octal string representation
        .split('')       // Break the octal string into an array of single character digits
        .map(function (charDigit) {
          // For each character digit, use its numeric value as an index into the digitMapping array
          return digitMapping[charDigit - 0];
        })
        .join('')        // Concatenate the mapped values back into a single string
      );
    }
  });
// This array defines the custom mapping for octal digits 0 through 7
})([0, 1, 2, 3, 5, 7, 8, 9]);
