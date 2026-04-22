/* This section handles system I/O and utility functions. It's not directly part of the core algorithm. */
let inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let dataStream;
let receivedLines = [];

inputReader.on('line', function(currentLine) {
    receivedLines.push(currentLine);
});

inputReader.on('close', function() {
    dataStream = initializeDataProcessor(receivedLines);
    console.error('\n▲ Input ▼ Output'); // Informative message indicating I/O direction
    ExecuteProgram();
});

function replicateObject(sourceObject) {
    return (sourceObject instanceof Set)
        ? new Set(Array.from(sourceObject))
        : JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInteger()       { return transformValue(fetchNextItem(), 1); }
function retrieveStringArray()   { return transformValue(fetchNextItem(), 2); }
function retrieveIntegerArray()  { return transformValue(fetchNextItem(), 4); }
function retrieveCharacterArray(){ return transformValue(fetchNextItem(), 6); }

function fetchNextItem() { return dataStream.next(); }
function hasMoreItems()  { return dataStream.hasNext(); }

function initializeDataProcessor(incomingDataLines) {
    return {
        sourceCollection: incomingDataLines,
        currentIndex: 0,
        maximumCount: incomingDataLines.length,

        // Checks if there are more items available for processing.
        hasNext: function() {
            return (this.currentIndex < this.maximumCount);
        },

        // Retrieves the next item from the collection.
        next: function() {
            if (this.hasNext()) {
                return this.sourceCollection[this.currentIndex++];
            } else {
                throw new Error('DataProcessingError: No further input items available.'); // Custom error message
            }
        }
    };
}

function displayResult(outputContent) {
    console.log(outputContent);
}

function logErrorDetails(debugInfo) {
    console.error('Diagnostic Log: ' + require('util').inspect(debugInfo, false, null));
}

/*
 * This utility function converts an input value based on a specified conversion type.
 *
 * Conversion Type Reference:
 *   - 1: Parses the input as an integer.
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits the input string by spaces and converts each part to a number.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits the input string into individual characters and converts each to a number.
 *   - 8: Joins an array of strings with spaces.
 *   - 9: Joins an array of strings with newline characters.
 *   - 0: Joins an array of strings without any separator.
 *   - Default (or unknown type): Returns the input value unchanged.
 */
function transformValue(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1: return parseInt(inputValue);
            case 2: return inputValue.split(' ');
            case 4: return inputValue.split(' ').map(val => Number(val));
            case 6: return inputValue.split('');
            case 7: return inputValue.split('').map(val => Number(val));
            case 8: return inputValue.join(' ');
            case 9: return inputValue.join('\n');
            case 0: return inputValue.join('');
            default: return inputValue;
        }
    } catch (conversionError) {
        // In case of any conversion error, return the original input value.
        return inputValue;
    }
}

/* End of I/O and utility setup. */
function ExecuteProgram() {
    let initialParams = retrieveIntegerArray();
    let elementCount = initialParams[0];
    let firstValue = initialParams[1];
    let secondValue = initialParams[2];

    let numberSequence = retrieveIntegerArray();

    if (elementCount === 1) {
        displayResult(Math.abs(numberSequence[elementCount - 1] - secondValue));
    } else {
        displayResult(Math.max(
            Math.abs(numberSequence[elementCount - 2] - numberSequence[elementCount - 1]),
            Math.abs(numberSequence[elementCount - 1] - secondValue)
        ));
    }
}