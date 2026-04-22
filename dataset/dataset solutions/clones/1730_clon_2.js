let inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataProcessor;
let capturedLines = [];

inputReader.on('line', function(currentLine) {
    capturedLines.push(currentLine);
});

inputReader.on('close', function() {
    dataProcessor = initializeProcessor(capturedLines);
    console.error('\n');
    let startTime = Date.now();
    executePrimaryLogic();
    let elapsedTime = Date.now() - startTime;
    logDebugMessage('Execution Duration: ' + elapsedTime + 'ms');
    logDebugMessage('Memory Used (Heap): ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceObject The object to copy.
 * @returns {any} A deep copy of the source object.
 */
function createDeepCopy(sourceObject) {
    return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Functions to retrieve and convert different data types from the input stream.
function retrieveInteger() {
    return performConversion(fetchNextItem(), 1);
}

function retrieveStringArray() {
    return performConversion(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
    return performConversion(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
    return performConversion(fetchNextItem(), 6);
}

function fetchNextItem() {
    return dataProcessor.fetchNextItem();
}

function hasMoreItems() {
    return dataProcessor.hasMoreItems();
}

/**
 * Initializes an input processor object.
 * @param {string[]} sourceData An array of strings representing input lines.
 * @returns {object} An object with methods to access input.
 */
function initializeProcessor(sourceData) {
    return {
        itemCollection: sourceData,
        currentPosition: 0,
        maximumItems: sourceData.length,
        hasMoreItems: function() {
            return (this.currentPosition < this.maximumItems);
        },
        fetchNextItem: function() {
            if (this.hasMoreItems()) {
                return this.itemCollection[this.currentPosition++];
            } else {
                throw 'Input Exhausted: No more items available to read.';
            }
        }
    };
}

function displayResult(resultValue) {
    console.log(resultValue);
}

function logDebugMessage(messageContent) {
    console.error('DEBUG INFO: ' + require('util').inspect(messageContent, false, null));
}

// Utility function for type conversion based on a specified type identifier.
// ConversionType 1: parse to integer.
// ConversionType 2: split by space.
// ConversionType 4: split by space and map to numbers.
// ConversionType 6: split into characters.
// ConversionType 7: split into characters and map to numbers.
// ConversionType 8: join by space.
// ConversionType 9: join by newline.
// ConversionType 0: join without separator.
function performConversion(valueToConvert, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(valueToConvert, 10);
            case 2:
                return valueToConvert.split(' ');
            case 4:
                return valueToConvert.split(' ').map(Number);
            case 6:
                return valueToConvert.split('');
            case 7:
                return valueToConvert.split('').map(Number);
            case 8:
                return valueToConvert.join(' ');
            case 9:
                return valueToConvert.join('\n');
            case 0:
                return valueToConvert.join('');
            default:
                return valueToConvert;
        }
    } catch (conversionError) {
        return valueToConvert;
    }
}

// Main operational logic of the application.
function executePrimaryLogic() {
    let upperLimit = retrieveInteger();
    let finalSum = 0;
    for (let iteratorVar = 1; iteratorVar <= upperLimit; iteratorVar++) {
        let divisorCount = Math.floor(upperLimit / iteratorVar);
        finalSum += iteratorVar * (divisorCount * (divisorCount + 1) / 2);
    }
    displayResult(finalSum);
}