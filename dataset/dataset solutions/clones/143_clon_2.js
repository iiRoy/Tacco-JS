const fileSystemModule = require('fs'); // Import the Node.js file system module

// Determine the total size of the standard input stream in bytes
let dataSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a new Buffer object of the determined size to hold the input data
let inputBuffer = new Buffer(dataSize);

// Read data synchronously from standard input into the buffer
// Parameters: file descriptor, buffer, offset, length, position
let readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string, then split it into an array of lines
// The last element of the array might be an empty string if the input ends with a newline
let linesOfInput = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Call the main function to begin processing the input
processCoordinates();

/**
 * Main function to process each line of coordinate data.
 * It calculates slopes between consecutive points and determines an output based on slope parity.
 */
function processCoordinates() {
  // Iterate through each line of input, excluding the potential empty last line
  for (let idx = 0, lineCount = linesOfInput.length - 1; idx < lineCount; idx++) {
    // Split the current line by comma to get individual coordinate components as strings
    const coordsStr = linesOfInput[idx].split(',');

    let positiveSlopes = 0; // Counter for slopes that are non-negative (>= 0)
    let negativeSlopes = 0; // Counter for slopes that are negative (< 0)

    // Calculate the slope between point A (coordsStr[0], coordsStr[1]) and point B (coordsStr[2], coordsStr[3])
    const slopeAB = (coordsStr[1] - coordsStr[3]) / (coordsStr[0] - coordsStr[2]);
    // Calculate the slope between point B (coordsStr[2], coordsStr[3]) and point C (coordsStr[4], coordsStr[5])
    const slopeBC = (coordsStr[3] - coordsStr[5]) / (coordsStr[2] - coordsStr[4]);
    // Calculate the slope between point C (coordsStr[4], coordsStr[5]) and point D (coordsStr[6], coordsStr[7])
    const slopeCD = (coordsStr[5] - coordsStr[7]) / (coordsStr[4] - coordsStr[6]);
    // Calculate the slope between point D (coordsStr[6], coordsStr[7]) and point A (coordsStr[0], coordsStr[1])
    const slopeDA = (coordsStr[7] - coordsStr[1]) / (coordsStr[6] - coordsStr[0]);

    // Increment appropriate counter based on the sign of slope AB
    slopeAB >= 0 ? positiveSlopes++ : negativeSlopes++;
    // Increment appropriate counter based on the sign of slope BC
    slopeBC >= 0 ? positiveSlopes++ : negativeSlopes++;
    // Increment appropriate counter based on the sign of slope CD
    slopeCD >= 0 ? positiveSlopes++ : negativeSlopes++;
    // Increment appropriate counter based on the sign of slope DA
    slopeDA >= 0 ? positiveSlopes++ : negativeSlopes++;

    // Output 'YES' if the count of non-negative slopes is odd, otherwise 'NO'
    console.log(positiveSlopes % 2 ? 'YES' : 'NO');
  }
}
