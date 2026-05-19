const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

let rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
let processedInputLines = rawInputContent.trim().split('\n');

function processTranslationBlock(linesBuffer) {
    // Check for termination condition or if the buffer is empty
    if (linesBuffer.length === 0) {
        return null; // Signal to stop processing
    }
    const firstLineValue = linesBuffer[0];
    if (firstLineValue === "0") {
        linesBuffer.shift(); // Consume the "0" line
        return null; // Signal to stop processing
    }

    // Extract the count of lines for the key-value map definitions
    const mapDefinitionCountStr = linesBuffer.shift();
    const mapDefinitionCount = parseInt(mapDefinitionCountStr, 10);

    const translationDictionary = {};
    // Populate the translation map
    for (let currentMapIndex = 0; currentMapIndex < mapDefinitionCount; currentMapIndex++) {
        // The original code would throw a TypeError if linesBuffer.shift() returns undefined here
        const mapEntryLine = linesBuffer.shift();
        const [keyIdentifier, valueContent] = mapEntryLine.trim().split(' ');
        translationDictionary[keyIdentifier] = valueContent;
    }

    // Extract the count of lines for the keys to be translated
    const keysToTranslateCountStr = linesBuffer.shift();
    const keysToTranslateCount = parseInt(keysToTranslateCountStr, 10);

    let finalTranslatedString = '';
    // Build the result string by translating keys
    for (let currentKeyIndex = 0; currentKeyIndex < keysToTranslateCount; currentKeyIndex++) {
        // The original code would throw a TypeError if linesBuffer.shift() returns undefined here
        const keyToLookup = linesBuffer.shift();
        const trimmedKey = keyToLookup.trim();
        
        // Use Object.prototype.hasOwnProperty.call for robust property existence check
        const segmentToAdd = Object.prototype.hasOwnProperty.call(translationDictionary, trimmedKey)
            ? translationDictionary[trimmedKey]
            : trimmedKey;
        finalTranslatedString += segmentToAdd;
    }

    return finalTranslatedString;
}

// Main processing loop for input blocks
while (processedInputLines.length > 0) {
    const blockOutput = processTranslationBlock(processedInputLines);

    if (blockOutput === null) {
        // This indicates either the "0" termination signal was found,
        // or the input buffer was exhausted, or malformed input led to a stop.
        break;
    }
    console.log(blockOutput);
}
