const systemInput = process.stdin;
const systemOutput = process.stdout;
const systemLog = console;
const moduleUtility = require('util');
const lineProcessorModule = require('readline');

// This section contains helper utilities and input/output management.
const inputReaderInterface = lineProcessorModule.createInterface({
    input: systemInput,
    output: systemOutput
});

let inputDataLoader;
const collectedInputLines = [];

inputReaderInterface.on('line', function(currentInputSegment) {
    collectedInputLines.push(currentInputSegment);
});

inputReaderInterface.on('close', function() {
    inputDataLoader = initializeInputProcessor(collectedInputLines);
    systemLog.error('\n^ Input v Output');
    executePrimaryRoutine();
});

/*
 * Produces a deep copy of an object.
 * If the object is a Set, it constructs a new Set from its elements.
 * Otherwise, it uses JSON serialization/deserialization for a generic deep clone.
 */
function duplicateStructure(originalEntity) {
    return (originalEntity instanceof Set) ? new Set(Array.from(originalEntity)) : JSON.parse(JSON.stringify(originalEntity));
}

// Retrieves and converts the subsequent input item as an integer.
function obtainNextInteger() {
    return convertInputFormat(fetchNextItem(), 1);
}

// Retrieves and converts the subsequent input item into a string array.
function obtainNextStringArray() {
    return convertInputFormat(fetchNextItem(), 2);
}

// Retrieves and converts the subsequent input item into an array of integers.
function obtainNextIntegerArray() {
    return convertInputFormat(fetchNextItem(), 4);
}

// Retrieves and converts the subsequent input item into a character array.
function obtainNextCharacterArray() {
    return convertInputFormat(fetchNextItem(), 6);
}

// Fetches the very next available input item from the data loader.
function fetchNextItem() {
    return inputDataLoader.fetchNextItem();
}

// Determines if additional input items are available for processing.
function checkMoreItemsAvailable() {
    return inputDataLoader.checkMoreItemsAvailable();
}

/*
 * Sets up the core input processing object.
 * This object manages reading input lines sequentially.
 * @param {Array<string>} sourceLineArray - An array of strings, each representing an input line.
 * @returns {object} An object providing methods for input access.
 */
function initializeInputProcessor(sourceLineArray) {
    return {
        lineCollection: sourceLineArray,
        currentReadIndex: 0,
        maximumLineCount: sourceLineArray.length,
        checkMoreItemsAvailable: function() {
            return (this.currentReadIndex < this.maximumLineCount);
        },
        fetchNextItem: function() {
            if (this.checkMoreItemsAvailable()) {
                return this.lineCollection[this.currentReadIndex++];
            } else {
                throw 'InputBoundsExceeded: No additional input elements exist.';
            }
        }
    };
}

// Displays a given message to the standard output stream.
function emitOutputMessage(displayContent) {
    systemLog.log(displayContent);
}

// Outputs a diagnostic or error message to the standard error stream.
function reportDiagnosticInfo(diagnosticData) {
    systemLog.error('diagnostic_info:' + moduleUtility.inspect(diagnosticData, false, null));
}

/*
 * This function handles various input data type conversions.
 * The 'conversionCase' parameter specifies the desired output format:
 *   - Any other value: Returns the input as is.
 *   - 1: Converts the input string to an integer.
 *   - 2: Splits the input string by spaces into an array of strings.
 *   - 4: Splits by spaces and maps to an array of numbers.
 *   - 6: Splits the input string into an array of individual characters.
 *   - 7: Splits into individual characters and maps to an array of numbers.
 *   - 8: Joins array elements with a space separator.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 */
function convertInputFormat(incomingItem, conversionCase) {
    try {
        switch (conversionCase) {
            case 1:
                return parseInt(incomingItem);
            case 2:
                return incomingItem.split(' ');
            case 4:
                return incomingItem.split(' ').map(Number);
            case 6:
                return incomingItem.split('');
            case 7:
                return incomingItem.split('').map(Number);
            case 8:
                return incomingItem.join(' ');
            case 9:
                return incomingItem.join('\n');
            case 0:
                return incomingItem.join('');
            default:
                return incomingItem;
        }
    } catch (conversionError) {
        return incomingItem; // In case of conversion failure, return the original item.
    }
}

// End of input/output and utility function definitions.
// -------------------------------------------------------------------

/**
 * This is the primary execution point for the algorithm.
 * It reads grid dimensions and values, then applies dynamic programming
 * to find the minimum absolute difference path through the grid.
 */
function executePrimaryRoutine() {
    const initialDimensions = obtainNextIntegerArray();
    const gridHeight = initialDimensions[0];
    const gridWidth = initialDimensions[1];

    const valueGrid = new Array(gridHeight);
    const dynamicProgrammingTable = new Array(gridHeight);
    const maximumPermissibleSum = 1272; // Upper bound for accumulated sums in DP states.

    // Initialize the main value grid and the DP state table.
    for (let currentHeightIdx = 0; currentHeightIdx < gridHeight; currentHeightIdx++) {
        dynamicProgrammingTable[currentHeightIdx] = new Array(gridWidth);
        for (let currentWidthIdx = 0; currentWidthIdx < gridWidth; currentWidthIdx++) {
            dynamicProgrammingTable[currentHeightIdx][currentWidthIdx] = new Array(maximumPermissibleSum);
        }
        valueGrid[currentHeightIdx] = obtainNextIntegerArray();
    }

    // Adjust grid values based on a second set of input.
    for (let currentHeightIdx = 0; currentHeightIdx < gridHeight; currentHeightIdx++) {
        const temporaryRowData = obtainNextIntegerArray();
        for (let currentWidthIdx = 0; currentWidthIdx < gridWidth; currentWidthIdx++) {
            valueGrid[currentHeightIdx][currentWidthIdx] = Math.abs(valueGrid[currentHeightIdx][currentWidthIdx] - temporaryRowData[currentWidthIdx]);
        }
    }

    // Establish the base case for the dynamic programming table at the starting cell.
    dynamicProgrammingTable[0][0][valueGrid[0][0]] = true;

    // Populate the DP table by iterating through all grid cells.
    for (let currentHeightIdx = 0; currentHeightIdx < gridHeight; currentHeightIdx++) {
        for (let currentWidthIdx = 0; currentWidthIdx < gridWidth; currentWidthIdx++) {

            // Skip the initial cell as its state is already defined.
            if (currentHeightIdx === 0 && currentWidthIdx === 0) {
                continue;
            }

            // For cells in the first row, transitions are only possible from the left.
            if (currentHeightIdx === 0) {
                for (let currentSumState = 0; currentSumState < maximumPermissibleSum; currentSumState++) {
                    if (dynamicProgrammingTable[currentHeightIdx][currentWidthIdx - 1][currentSumState]) {
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState + valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState - valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                    }
                }
            }
            // For cells in the first column, transitions are only possible from above.
            else if (currentWidthIdx === 0) {
                for (let currentSumState = 0; currentSumState < maximumPermissibleSum; currentSumState++) {
                    if (dynamicProgrammingTable[currentHeightIdx - 1][currentWidthIdx][currentSumState]) {
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState + valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState - valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                    }
                }
            }
            // For all other cells, transitions can occur from either above or the left.
            else {
                for (let currentSumState = 0; currentSumState < maximumPermissibleSum; currentSumState++) {
                    // Check for paths originating from the cell directly above.
                    if (dynamicProgrammingTable[currentHeightIdx - 1][currentWidthIdx][currentSumState]) {
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState + valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState - valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                    }
                    // Check for paths originating from the cell directly to the left.
                    if (dynamicProgrammingTable[currentHeightIdx][currentWidthIdx - 1][currentSumState]) {
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState + valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                        dynamicProgrammingTable[currentHeightIdx][currentWidthIdx][Math.abs(currentSumState - valueGrid[currentHeightIdx][currentWidthIdx])] = true;
                    }
                }
            }
        }
    }

    // Search for the smallest absolute difference achievable at the final grid cell.
    for (let currentSumState = 0; currentSumState < maximumPermissibleSum; currentSumState++) {
        if (dynamicProgrammingTable[gridHeight - 1][gridWidth - 1][currentSumState]) {
            emitOutputMessage(currentSumState);
            return; // Output the first valid sum found and terminate.
        }
    }
}