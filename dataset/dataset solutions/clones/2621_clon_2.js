// This section handles input processing and foundational utilities.
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataStore;
let rawLines = [];

inputReader.on('line', function(currentLine) {
    rawLines.push(currentLine);
});

inputReader.on('close', function() {
    dataStore = initializeData(rawLines);
    console.error('\n--- Input processed, output follows ---');
    ExecuteLogic();
});

/**
 * Creates a deep copy of an object.
 * Handles Set objects by converting them to an array and back to a new Set.
 * For other objects, it uses JSON serialization/deserialization.
 * @param {any} originalObject The object to be duplicated.
 * @returns {any} A new, independent copy of the object.
 */
function deepCopy(originalObject) {
    return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next item from the input stream and parses it as an integer.
 * @returns {number} The next integer value.
 */
function readInteger() {
    return dataTransformer(getNextItem(), 1);
}

/**
 * Retrieves the next item from the input stream and splits it into an array of strings.
 * @returns {string[]} An array of strings.
 */
function readStringArray() {
    return dataTransformer(getNextItem(), 2);
}

/**
 * Retrieves the next item from the input stream, splits it, and parses elements as integers.
 * @returns {number[]} An array of integer values.
 */
function readIntegerArray() {
    return dataTransformer(getNextItem(), 4);
}

/**
 * Retrieves the next item from the input stream and splits it into an array of single characters.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
    return dataTransformer(getNextItem(), 6);
}

/**
 * Advances the data iterator and returns the next available input item.
 * @returns {string} The next string from the input.
 */
function getNextItem() {
    return dataStore.getNextItem();
}

/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() {
    return dataStore.hasMoreItems();
}

/**
 * Initializes the data iterator with the provided input lines.
 * @param {string[]} sourceLines An array of raw input strings.
 * @returns {object} An object with methods to iterate through input.
 */
function initializeData(sourceLines) {
    return {
        lineCollection: sourceLines,
        currentIndex: 0,
        maxIndex: sourceLines.length,
        hasMoreItems: function() {
            return (this.currentIndex < this.maxIndex);
        },
        getNextItem: function() {
            if (this.hasMoreItems()) {
                return this.lineCollection[this.currentIndex++];
            } else {
                throw new Error('DataIteratorOutOfBounds: No further input available.');
            }
        }
    };
}

/**
 * Prints a message to the standard output.
 * @param {any} messageContent The content to be logged.
 */
function printResult(messageContent) {
    console.log(messageContent);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {any} debugMessage The message or object to debug.
 */
function logDebug(debugMessage) {
    console.error('DEBUG INFO: ' + require('util').inspect(debugMessage, false, null));
}

/**
 * Transforms an input value based on a specified type.
 * @param {any} valueToTransform The value to process.
 * @param {number} transformType An integer code indicating the desired transformation.
 *   - 1: Parse as integer.
 *   - 2: Split by space into string array.
 *   - 4: Split by space into integer array.
 *   - 6: Split into character array.
 *   - 7: Split into character array and parse as integers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without any separator.
 * @returns {any} The transformed value.
 */
function dataTransformer(valueToTransform, transformType) {
    try {
        switch (transformType) {
            case 1:
                return parseInt(valueToTransform);
            case 2:
                return valueToTransform.split(' ');
            case 4:
                return valueToTransform.split(' ').map(Number);
            case 6:
                return valueToTransform.split('');
            case 7:
                return valueToTransform.split('').map(Number);
            case 8:
                return valueToTransform.join(' ');
            case 9:
                return valueToTransform.join('\n');
            case 0:
                return valueToTransform.join('');
            default:
                return valueToTransform;
        }
    } catch (e) {
        return valueToTransform;
    }
}

// End of input/utility boilerplate.
// -------------------------------------------------------------

/**
 * The primary execution function containing the core logic.
 * This function calculates specific bit differences between number pairs.
 */
function ExecuteLogic() {
    const limitValue = readInteger();
    const resultList = [];

    // Iterate through all unique pairs (firstIndex, secondIndex) where firstIndex < secondIndex
    for (let firstIndex = 0; firstIndex < limitValue - 1; firstIndex++) {
        for (let secondIndex = firstIndex + 1; secondIndex < limitValue; secondIndex++) {
            // For each pair, check bit positions from 0 to 9
            for (let bitPosition = 0; bitPosition < 10; bitPosition++) {
                // Compare the 'bitPosition'-th bit of firstIndex and secondIndex
                // If the bits are different, record the bit position (plus one)
                if (((firstIndex >> bitPosition) & 1) !== ((secondIndex >> bitPosition) & 1)) {
                    resultList.push(bitPosition + 1);
                }
            }
        }
    }

    // Output the collected bit positions, each on a new line
    printResult(dataTransformer(resultList, 9));
}