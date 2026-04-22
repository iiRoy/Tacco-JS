const fileSystemAccess = require("node:fs");
const standardInputFD = 0;
const dataChunkSize = 4096; // Arbitrary chunk size for reading

let accumulatedData = [];
let cumulativeByteCount = 0;
let bytesFromChunk;

// Loop to read all available data from standard input
do {
    const temporaryBuffer = Buffer.alloc(dataChunkSize);
    try {
        bytesFromChunk = fileSystemAccess.readSync(standardInputFD, temporaryBuffer, 0, dataChunkSize, null);
    } catch (readError) {
        // In case of an error during read, treat it as end of input for this context
        bytesFromChunk = 0;
    }

    if (bytesFromChunk > 0) {
        accumulatedData.push(temporaryBuffer.slice(0, bytesFromChunk));
        cumulativeByteCount += bytesFromChunk;
    }
} while (bytesFromChunk > 0);

const fullInputString = Buffer.concat(accumulatedData, cumulativeByteCount).toString("utf8");

// Identify the first line by finding the first newline character
const lineBreakIndex = fullInputString.indexOf('\n');
let initialSegment;
if (lineBreakIndex !== -1) {
    initialSegment = fullInputString.substring(0, lineBreakIndex);
} else {
    initialSegment = fullInputString; // If no newline, consider the entire content as the first line
}

// Convert the extracted string to a numerical value
const numericalQuantity = Number(initialSegment);

// Calculate the cube of the numerical value
const calculatedCube = Math.pow(numericalQuantity, 3);

// Write the result to standard output, followed by a newline
process.stdout.write(calculatedCube.toString() + '\n');