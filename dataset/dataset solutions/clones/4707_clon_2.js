var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var dataSource;
var lineAccumulator = [];

inputHandler.on('line', function(receivedText) {
    lineAccumulator.push(receivedText);
});

inputHandler.on('close', function() {
    dataSource = initializeDataProcessor(lineAccumulator);
    console.error('\n--- Input above, Program Output below ---');
    executeMainRoutine();
});

/**
 * Creates a duplicate of an object or a Set.
 * For objects, it performs a deep copy via JSON serialization.
 * @param {any} originalItem The element to be duplicated.
 * @returns {any} A fresh copy of the element.
 */
function createDeepDuplicate(originalItem) {
    return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

/**
 * Fetches the next input token and interprets it as an integer.
 * @returns {number} The parsed integer value.
 */
function fetchNextInteger() {
    return processInputToken(obtainNextToken(), 1);
}

/**
 * Fetches the next input token and splits it into a string array.
 * @returns {string[]} An array of strings.
 */
function fetchNextStringList() {
    return processInputToken(obtainNextToken(), 2);
}

/**
 * Fetches the next input token, splits it, and parses parts as integers.
 * @returns {number[]} An array of integers.
 */
function fetchNextIntegerList() {
    return processInputToken(obtainNextToken(), 4);
}

/**
 * Fetches the next input token and divides it into individual characters.
 * @returns {string[]} An array of characters.
 */
function fetchNextCharacterList() {
    return processInputToken(obtainNextToken(), 6);
}

/**
 * Retrieves the subsequent input item from the data source.
 * @returns {string} The next available input item.
 */
function obtainNextToken() {
    return dataSource.getNextItem();
}

/**
 * Determines if there are more items to consume from the input.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function moreItemsAvailable() {
    return dataSource.hasMore();
}

/**
 * Configures the input parsing mechanism.
 * @param {string[]} rawInputLines An array of raw text lines received.
 * @returns {object} An object with sequential access methods for input.
 */
function initializeDataProcessor(rawInputLines) {
    return {
        inputSequence: rawInputLines,
        currentAccessIndex: 0,
        maximumIndex: rawInputLines.length,
        hasMore: function() {
            return (this.currentAccessIndex < this.maximumIndex);
        },
        getNextItem: function() {
            if (this.hasMore()) {
                return this.inputSequence[this.currentAccessIndex++];
            } else {
                throw 'InputDepletionError :: No more input lines are available.';
            }
        }
    };
}

/**
 * Prints a value to the standard output console.
 * @param {any} content The data to be outputted.
 */
function printOutput(content) {
    console.log(content);
}

/**
 * Outputs a detailed debug message to the error console.
 * @param {any} debugObject The object to inspect and log.
 */
function logDebugInfo(debugObject) {
    console.error('DEBUG_LOG: ' + require('util').inspect(debugObject, false, null));
}

// The 'conversionSpecifier' parameter dictates the transformation:
//  1: Parse the string as a base-10 integer.
//  2: Divide the string by spaces into an array of strings.
//  4: Divide by spaces, then convert each segment to a number.
//  6: Break the string into an array of single characters.
//  7: Break into characters, then convert each to a number.
//  8: Combine array elements using a space as a delimiter.
//  9: Combine array elements using a newline as a delimiter.
//  0: Combine array elements without any delimiter.
//  Any other value: Return the input unchanged.
function processInputToken(inputContent, conversionSpecifier) {
    try {
        switch (conversionSpecifier) {
            case 1:
                return parseInt(inputContent);
            case 2:
                return inputContent.split(' ');
            case 4:
                return inputContent.split(' ').map(Number);
            case 6:
                return inputContent.split('');
            case 7:
                return inputContent.split('').map(Number);
            case 8:
                return inputContent.join(' ');
            case 9:
                return inputContent.join('\n');
            case 0:
                return inputContent.join('');
            default:
                return inputContent;
        }
    } catch (e) {
        return inputContent; // Return original if conversion fails
    }
}
// Auxiliary processing utilities end here --

/**
 * This is the primary function where the core algorithm resides.
 * It determines a sequence based on initial conditions and a character string.
 */
function executeMainRoutine() {
    var sequenceSize = fetchNextInteger();
    var characterSeries = fetchNextCharacterList();
    var startingConfigurations = [
        ["S", "S"],
        ["S", "W"],
        ["W", "S"],
        ["W", "W"]
    ];

    for (var configIdx = 0; configIdx < startingConfigurations.length; configIdx++) {
        var generatedSequence = new Array(sequenceSize + 2);
        generatedSequence[0] = startingConfigurations[configIdx][0];
        generatedSequence[1] = startingConfigurations[configIdx][1];

        for (var currentPos = 0; currentPos < sequenceSize; currentPos++) {
            if (characterSeries[currentPos] == "o") {
                if (generatedSequence[currentPos] == generatedSequence[currentPos + 1]) {
                    generatedSequence[currentPos + 2] = "S";
                } else {
                    generatedSequence[currentPos + 2] = "W";
                }
            } else { // Assuming 'x' if not 'o'
                if (generatedSequence[currentPos] != generatedSequence[currentPos + 1]) {
                    generatedSequence[currentPos + 2] = "S";
                } else {
                    generatedSequence[currentPos + 2] = "W";
                }
            }
        }

        // Validate the generated sequence against boundary conditions
        if (generatedSequence[0] == generatedSequence[sequenceSize] && generatedSequence[1] == generatedSequence[sequenceSize + 1]) {
            generatedSequence.pop(); // Remove the trailing placeholder element
            generatedSequence.pop(); // Remove another trailing placeholder element
            printOutput(generatedSequence.join(""));
            return; // Found a valid sequence, terminate
        }
    }

    // If no valid sequence could be constructed after all attempts
    printOutput(-1);
}