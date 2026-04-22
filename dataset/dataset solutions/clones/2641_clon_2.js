var inputInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var dataHandler;
var capturedLines = [];

inputInterface.registerEvent('line', function (currentInputLine) {
    capturedLines.push(currentInputLine);
});

inputInterface.registerEvent('close', function () {
    dataHandler = initializeInputHandler(capturedLines);
    logToErrorStream("\n");

    var opStartTime = Date.now();
    executeMainProgram();
    var durationMs = Date.now() - opStartTime;

    outputDebugInfo("elapsedTime : " + (durationMs) + "milliseconds");
    outputDebugInfo("heapMemory : " + Math.round(process.memoryUsage().heapTotal / kilobyteDivisor) + "kilobytes");
});

function createDeepCopy(originalObject) {
    return JSON.parse(JSON.stringify(originalObject));
}

// Constants defining various data conversion types.
const TYPE_INTEGER = 1;
const TYPE_STRING_ARRAY = 2;
const TYPE_NUMBER_ARRAY = 4;
const TYPE_CHAR_ARRAY = 6;
const TYPE_CHAR_ARRAY_NUMERIC = 7;
const TYPE_JOIN_SPACE = 8;
const TYPE_JOIN_NEWLINE = 9;
const TYPE_JOIN_NONE = 0;
const kilobyteDivisor = 1024; // The factor to convert bytes into kilobytes.

function getNextInteger() {
    return transformValue(retrieveNextItem(), TYPE_INTEGER);
}

function getNextStringArray() {
    return transformValue(retrieveNextItem(), TYPE_STRING_ARRAY);
}

function getNextIntegerArray() {
    return transformValue(retrieveNextItem(), TYPE_NUMBER_ARRAY);
}

function getNextCharacterArray() {
    return transformValue(retrieveNextItem(), TYPE_CHAR_ARRAY);
}

function retrieveNextItem() {
    return dataHandler.retrieveNextItem();
}

function hasMoreData() {
    return dataHandler.hasMoreData();
}

function initializeInputHandler(rawInputLines) {
    var parsedDataSource = {
        sourceCollection: rawInputLines,
        currentPosition: 0,
        maxCount: rawInputLines.length,

        hasMoreData: function () {
            return (this.currentPosition < this.maxCount);
        },

        retrieveNextItem: function () {
            if (!this.hasMoreData()) {
                throw "SequenceOutOfBoundsException: No more elements available for retrieval.";
            } else {
                var returnedSegment = this.sourceCollection[this.currentPosition];
                this.currentPosition++;
                return returnedSegment;
            }
        }
    };
    return parsedDataSource;
}

function displayOutput(contentToDisplay) {
    console.log(contentToDisplay);
}

function outputDebugInfo(messageContent) {
    // Utilize the 'util' module for detailed object inspection.
    var utilityModule = require("util");
    logToErrorStream("dbgMessage:" + utilityModule.inspect(messageContent, false, null));
}

function logToErrorStream(message) {
    console.error(message);
}

// This function processes an input value based on a specified conversion type.
// [conversionType] governs the transformation.
// Default behavior (or on error): The original input value is returned.
// TYPE_INTEGER: Converts the input string to an integer.
// TYPE_STRING_ARRAY: Splits the input string using space as a delimiter.
// TYPE_NUMBER_ARRAY: Splits the string by spaces and then converts each part to a number.
// TYPE_CHAR_ARRAY: Divides the string into an array of individual characters.
// TYPE_CHAR_ARRAY_NUMERIC: Splits by characters and converts each to a number.
// TYPE_JOIN_SPACE: Combines array elements into a string, separated by spaces.
// TYPE_JOIN_NEWLINE: Joins array elements with newline characters.
// TYPE_JOIN_NONE: Concatenates array elements without any separator.
function transformValue(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case TYPE_INTEGER:
                return parseInt(inputValue);
            case TYPE_STRING_ARRAY:
                return inputValue.split(" ");
            case TYPE_NUMBER_ARRAY:
                return inputValue.split(" ").map(Number);
            case TYPE_CHAR_ARRAY:
                return inputValue.split("");
            case TYPE_CHAR_ARRAY_NUMERIC:
                return inputValue.split("").map(Number);
            case TYPE_JOIN_SPACE:
                return inputValue.join(" ");
            case TYPE_JOIN_NEWLINE:
                return inputValue.join("\n");
            case TYPE_JOIN_NONE:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (processingError) {
        return inputValue;
    }
}


// End of boilerplate and helper functions.
function executeMainProgram() {
    var firstSequence = retrieveNextItem();
    var secondSequence = retrieveNextItem();
    var charOccurrences = {};
    var finalCalculatedResult = 0;

    for (var idx = 0; idx < firstSequence.length; idx++) {
        if (charOccurrences[firstSequence[idx]] === undefined) {
            charOccurrences[firstSequence[idx]] = [];
        }
        charOccurrences[firstSequence[idx]].push(idx);
    }

    var lastMatchedPosition = -1;
    var fullCycleCount = 0;

    for (var idx = 0; idx < secondSequence.length; idx++) {
        if (charOccurrences[secondSequence[idx]] === undefined) {
            displayOutput(-1);
            return;
        }

        if (idx === 0) {
            finalCalculatedResult = charOccurrences[secondSequence[idx]][0] + 1;
            lastMatchedPosition = charOccurrences[secondSequence[idx]][0];
        } else {
            var foundIdx = findValueIndex(charOccurrences[secondSequence[idx]], lastMatchedPosition);

            if (foundIdx === charOccurrences[secondSequence[idx]].length || charOccurrences[secondSequence[idx]][foundIdx] === lastMatchedPosition) {
                fullCycleCount++;
                foundIdx = 0;
            }

            finalCalculatedResult = (fullCycleCount * firstSequence.length) + charOccurrences[secondSequence[idx]][foundIdx] + 1;
            lastMatchedPosition = charOccurrences[secondSequence[idx]][foundIdx];
        }
    }

    displayOutput(finalCalculatedResult);
}

function findValueIndex(orderedArray, targetElement) {
    // This routine performs a binary search on a sorted array to locate the lower bound.
    // The 'orderedArray' is expected to be sorted in ascending order.
    // 'highBoundary' will represent the smallest index where the element is greater than or equal to 'targetElement'.
    // 'lowBoundary' will be the largest index where the element is strictly less than 'targetElement'.
    var lowBoundary = -1;
    var highBoundary = orderedArray.length;
    var middleIndex;

    while (Math.abs(highBoundary - lowBoundary) > 1) {
        middleIndex = Math.floor((highBoundary + lowBoundary) / 2);
        if (orderedArray[middleIndex] >= targetElement) {
            highBoundary = middleIndex;
        } else {
            lowBoundary = middleIndex;
        }
    }
    return highBoundary;
    // The following line is commented out, as it was in the original source,
    // indicating an alternative return value if a different search strategy were used.
    // return orderedArray[lowBoundary];
}