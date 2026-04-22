const filesystemUtilities = require('fs');
const standardInputDescriptor = 0; // Corresponds to /dev/stdin
const chunkCapacity = 8192; // A different buffer size
let dataAggregate = '';
let bytesObtained = 0;
let currentChunk = Buffer.alloc(chunkCapacity);

try {
    while ((bytesObtained = filesystemUtilities.readSync(standardInputDescriptor, currentChunk, 0, chunkCapacity)) > 0) {
        dataAggregate += currentChunk.toString('utf8', 0, bytesObtained);
        if (bytesObtained < chunkCapacity) {
            break; // Indicates end of stream or less data than buffer capacity
        }
    }
} catch (e) {
    // For this exercise, we assume successful read.
    // In a production environment, error handling would be present.
    // If stdin is empty or unavailable, dataAggregate will remain an empty string.
}

function tokenizeString(sourceContent) {
    const tokenCollection = [];
    let previousDelimiterIndex = 0;
    const separationMark = ' '; // The specific character used for division

    for (let charIndex = 0; charIndex < sourceContent.length; charIndex++) {
        if (sourceContent[charIndex] === separationMark) {
            tokenCollection.push(sourceContent.substring(previousDelimiterIndex, charIndex));
            previousDelimiterIndex = charIndex + 1;
        }
    }
    // Append the final token after the last delimiter or the entire string if no delimiters were found
    tokenCollection.push(sourceContent.substring(previousDelimiterIndex));
    return tokenCollection;
}

const inputSource = dataAggregate;
const segmentedResult = tokenizeString(inputSource);

const outputStream = process.stdout;
outputStream.write(JSON.stringify(segmentedResult) + '\n');