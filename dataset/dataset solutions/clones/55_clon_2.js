// This script handles standard input operations.
var fs = require('fs'), // Import the file system module.
    dataSize = fs.fstatSync(process.stdin.fd).size, // Determine the size of the input stream.
    dataBuffer = new Buffer(dataSize), // Allocate a buffer to hold the input.
    actualBytesRead = fs.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0), // Read data from standard input into the buffer.
    processedLines = dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n'); // Convert buffer to string, trim, and split into an array of lines.

// Initiate the primary execution flow.
executeProgram();

/**
 * Main function to process the input lines.
 * It simulates a stack-like behavior based on numeric input.
 */
function executeProgram() {
    var dataStack = []; // Initialize an empty array to act as a stack.

    // Iterate through each line of the processed input.
    for (var idx = 0, totalLines = processedLines.length; idx < totalLines; idx++) {
        var currentValue = processedLines[idx] - 0; // Convert the current line to a number.

        // If the numeric value is truthy (non-zero), push it onto the stack.
        if (currentValue) {
            dataStack.push(currentValue);
        } else {
            // If the numeric value is falsy (zero), pop from the stack and print.
            console.log(dataStack.pop());
        }
    }
}
