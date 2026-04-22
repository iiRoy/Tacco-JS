// Renamed variable for the 'fs' module.
const fileSystemInterface = require('fs');

// A custom utility to retrieve text content from a specified file path using UTF-8 encoding.
function acquireFileText(pathSource, encodingScheme) {
    return fileSystemInterface.readFileSync(pathSource, encodingScheme);
}

// A helper function to remove leading/trailing whitespace from a string.
function purifyString(rawText) {
    return rawText.trim();
}

// A helper function to divide a string into an array of substrings based on a delimiter.
function segmentString(sourceInput, separatorSymbol) {
    return sourceInput.split(separatorSymbol);
}

// A helper function to apply a transformation function to each element of an array.
function processArrayElements(inputCollection, elementTransformer) {
    return inputCollection.map(elementTransformer);
}

// A helper function to remove and return the first element from an array.
function popFirstElement(targetArray) {
    return targetArray.shift();
}

// A conversion utility to parse a string into an integer value (base 10).
const parseNumericValue = (strValue) => parseInt(strValue, 10);


// Read the initial raw content from the standard input source.
let initialContentBuffer = acquireFileText('/dev/stdin', 'utf8');

// Clean the raw content and split it into an array of individual lines.
let dataLines = segmentString(purifyString(initialContentBuffer), "\n");

// Begin an iterative process for handling input data blocks.
for ( ; ; ) {
    // Extract the first available line, split it by space, and convert parts to integers to get dimension information.
    let currentBlockDimensions = processArrayElements(segmentString(popFirstElement(dataLines), " "), parseNumericValue);

    // Check if both dimension values are zero; if so, this indicates the termination condition.
    if (currentBlockDimensions[0] === 0 && currentBlockDimensions[1] === 0)
        break; // Exit the primary processing loop.

    // Iterate a number of times equivalent to the second dimension value.
    for (let indexCount = 0; indexCount < currentBlockDimensions[1]; indexCount++) {
        // Discard subsequent lines as specified by the current block's requirements.
        popFirstElement(dataLines);
    }
}