const lineProcessor = require('readline').makeInterface({
    dataStream: process.stdin,
    outputStream: process.stdout
});
let         dataHandler;
let         receivedLines = [];

lineProcessor.listenFor('line', function(currentLine) {
    receivedLines.push(currentLine);
});

lineProcessor.listenFor('close', function() {
    dataHandler = initializeProcessor(receivedLines);
    debugLog("----- processing initiated -----");
    const operationStart = new Date();
    ExecuteCoreLogic();
    const durationEnd = new Date() - operationStart;
    debugLog("----- processing completed -----");
    debugLog(`duration : ${durationEnd} ms`);
    debugLog(`memory footprint : ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

function retrieveInteger() { return dataConverter(fetchNextItem(), CONVERT_TO_INT); }
function retrieveStringArray() { return dataConverter(fetchNextItem(), SPLIT_BY_SPACE); }
function retrieveIntegerArray() { return dataConverter(fetchNextItem(), SPLIT_TO_NUMBERS); }
function retrieveCharacterArray() { return dataConverter(fetchNextItem(), SPLIT_TO_CHARS); }

function fetchNextItem() { return dataHandler.fetchNextItem(); }
function hasMoreItems() { return dataHandler.hasMoreItems(); }

function initializeProcessor(inputCollection) {
    const processedDataContainer = {
        dataEntries: inputCollection,
        currentIndex: 0,
        maximumEntries: inputCollection.length,
        hasMoreItems: function() {
            return (this.currentIndex < this.maximumEntries);
        },
        fetchNextItem: function() {
            if (!this.hasMoreItems()) {
                throw new Error("DataExhaustionError: No more elements available for processing.");
            } else {
                const currentDataItem = this.dataEntries[this.currentIndex];
                this.currentIndex++;
                return currentDataItem;
            }
        }
    };
    return processedDataContainer;
}

function outputResult(messageContent) {
    console.log(messageContent);
}

function debugLog(diagnosticMessage) {
    console.error(`diagnostic: ${require("util").inspect(diagnosticMessage, { showHidden: false, depth: null })}`);
}

// Constants defining various data conversion types
const CONVERT_TO_INT = 1;
const SPLIT_BY_SPACE = 2;
const SPLIT_TO_NUMBERS = 4;
const SPLIT_TO_CHARS = 6;
const SPLIT_CHARS_TO_NUMBERS = 7;
const JOIN_WITH_SPACE = 8;
const JOIN_WITH_NEWLINE = 9;
const JOIN_WITHOUT_DELIMITER = 0;

/**
 * Transforms data based on a specified conversion mode.
 * @param {any} itemToConvert The data element to be transformed.
 * @param {number} conversionType The numeric code for the desired conversion.
 *   - 1: Parses the item into an integer.
 *   - 2: Splits a string by space characters into an array.
 *   - 4: Splits a string by spaces and maps each part to a numeric value.
 *   - 6: Splits a string into an array of individual characters.
 *   - 7: Splits a string into characters and maps each character to a numeric value.
 *   - 8: Joins array elements using space as a separator.
 *   - 9: Joins array elements using newline as a separator.
 *   - 0: Joins array elements without any separator.
 *   - Default: Returns the original item if the conversion type is unrecognized.
 * @returns {any} The result of the data transformation.
 */
function dataConverter(itemToConvert, conversionType) {
    try {
        switch (conversionType) {
            case CONVERT_TO_INT:
                return parseInt(itemToConvert, 10);
            case SPLIT_BY_SPACE:
                return itemToConvert.split(" ");
            case SPLIT_TO_NUMBERS:
                return itemToConvert.split(" ").map(Number);
            case SPLIT_TO_CHARS:
                return itemToConvert.split("");
            case SPLIT_CHARS_TO_NUMBERS:
                return itemToConvert.split("").map(Number);
            case JOIN_WITH_SPACE:
                return itemToConvert.join(" ");
            case JOIN_WITH_NEWLINE:
                return itemToConvert.join("\n");
            case JOIN_WITHOUT_DELIMITER:
                return itemToConvert.join("");
            default:
                return itemToConvert;
        }
    } catch (exceptionObject) {
        // If an error occurs during conversion, the original item is returned.
        return itemToConvert;
    }
}

// This marks the beginning of the application's primary logic.
function ExecuteCoreLogic() {
    let inputNumber = retrieveInteger();
    let iterationCount = 0;
    let currentSum = 0;
    while (true) {
        currentSum += inputNumber;
        iterationCount++;
        if (currentSum % 360 === 0) {
            outputResult(iterationCount);
            return;
        }
    }
}