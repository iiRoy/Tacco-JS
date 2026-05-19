var fileSystem = require('fs');

// Determine the size of the standard input stream.
let dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the incoming data.
let rawData = Buffer.alloc(dataSize);

// Read data from standard input into the buffer.
let octetsRead = fileSystem.readSync(process.stdin.fd, rawData, 0, dataSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines.
let linesOfData = rawData.toString('utf8', 0, octetsRead).split('\n');

// Initiate the primary processing routine.
processInput();

/**
 * Main function to process each line of input data.
 * It calculates slopes between consecutive points and determines
 * if the number of non-negative slopes is odd or even.
 */
function processInput() {
  // Iterate through each line of data, excluding the last empty line if present.
  for (let idx = 0, maxIdx = linesOfData.length - 1; idx < maxIdx; idx++) {
    // Split the current line by comma to get coordinate values.
    const coords = linesOfData[idx].split(',');

    // Initialize counters for non-negative and negative slopes.
    let positiveSlopes = 0;
    let negativeSlopes = 0;

    // Calculate the slope between point A (c[0], c[1]) and B (c[2], c[3]).
    const slopeAB = (coords[1] - coords[3]) / (coords[0] - coords[2]);
    // Calculate the slope between point B (c[2], c[3]) and C (c[4], c[5]).
    const slopeBC = (coords[3] - coords[5]) / (coords[2] - coords[4]);
    // Calculate the slope between point C (c[4], c[5]) and D (c[6], c[7]).
    const slopeCD = (coords[5] - coords[7]) / (coords[4] - coords[6]);
    // Calculate the slope between point D (c[6], c[7]) and A (c[0], c[1]).
    const slopeDA = (coords[7] - coords[1]) / (coords[6] - coords[0]);

    // Increment appropriate counter based on slope sign.
    slopeAB >= 0 ? positiveSlopes++ : negativeSlopes++;
    slopeBC >= 0 ? positiveSlopes++ : negativeSlopes++;
    slopeCD >= 0 ? positiveSlopes++ : negativeSlopes++;
    slopeDA >= 0 ? positiveSlopes++ : negativeSlopes++;

    // Output 'YES' if the count of non-negative slopes is odd, 'NO' otherwise.
    console.log(positiveSlopes % 2 ? 'YES' : 'NO');
  }
}
