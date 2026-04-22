var inputReader = require('readline').createInterface({
    input : process.stdin,
    output: process.stdout
});

var dataStream;
var capturedLines = [];

inputReader.on('line', function(currentLine) {
    capturedLines.push(currentLine);
});

inputReader.on('close', function() {
    dataStream = initializeStream(capturedLines);
    console.error('\n↑ Input Data ↓ Output Result');
    ProcessMainLogic();
});

// Utility function to create a deep clone of various data types.
function deepCopyValue(originalObject) {
    return (originalObject instanceof Set)
        ? new Set(Array.from(originalObject))
        : JSON.parse(JSON.stringify(originalObject));
}

function getInteger() { return transformInput(retrieveNext(), 1); }
function getStringArray() { return transformInput(retrieveNext(), 2); }
function getIntegerArray() { return transformInput(retrieveNext(), 4); }
function getCharacterArray() { return transformInput(retrieveNext(), 6); }

function retrieveNext() { return dataStream.retrieveNext(); }
function hasMoreElements() { return dataStream.hasMoreElements(); }

// Initializes an object to manage input lines from the console.
function initializeStream(inputLines) {
    return {
        sourceData: inputLines,
        currentIndex: 0,
        maximumCount: inputLines.length,
        hasMoreElements: function() {
            return (this.currentIndex < this.maximumCount);
        },
        retrieveNext: function() {
            if (this.hasMoreElements()) {
                return this.sourceData[this.currentIndex++];
            } else {
                throw 'StreamOutOfBoundsException: No more input available.';
            }
        }
    };
}

function printResult(outputValue) {
    console.log(outputValue);
}

function logError(errorInfo) {
    console.error('debug-info: ' + require('util').inspect(errorInfo, false, null));
}

/*
 * This function performs various data transformations on input values.
 * Specific transformType values dictate the operation:
 *  1: Convert to an integer.
 *  2: Split string by spaces into an array of strings.
 *  4: Split string by spaces and convert parts to numbers.
 *  6: Split string into individual characters (array of strings).
 *  7: Split string into characters and convert them to numbers.
 *  8: Join array elements with spaces.
 *  9: Join array elements with newline characters.
 *  0: Join array elements without any separator.
 *  Any other value: Return the item as is without modification.
 */
function transformInput(itemValue, transformType) {
    try {
        switch (transformType) {
            case 1:
                return Number.parseInt(itemValue);
            case 2:
                return itemValue.split(' ');
            case 4:
                return itemValue.split(' ').map(Number);
            case 6:
                return itemValue.split('');
            case 7:
                return itemValue.split('').map(Number);
            case 8:
                return itemValue.join(' ');
            case 9:
                return itemValue.join('\n');
            case 0:
                return itemValue.join('');
            default:
                return itemValue;
        }
    } catch (conversionError) {
        return itemValue;
    }
}

function ProcessMainLogic() {
    var dimensionsInput = getIntegerArray();
    var gridHeight = dimensionsInput[0];
    var gridWidth = dimensionsInput[1];

    var valueGrid = new Array(gridHeight);
    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        valueGrid[rowIdx] = getIntegerArray();
    }

    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        var tempRowData = getIntegerArray();
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            valueGrid[rowIdx][colIdx] = Math.abs(valueGrid[rowIdx][colIdx] - tempRowData[colIdx]);
        }
    }

    var maximumPossibleSum = 13000;
    var dynamicProgrammingTable = new Array(gridHeight + 1);

    for (var rowIdx = 0; rowIdx < gridHeight + 1; rowIdx++) {
        dynamicProgrammingTable[rowIdx] = new Array(gridWidth + 1);
        for (var colIdx = 0; colIdx < gridWidth + 1; colIdx++) {
            dynamicProgrammingTable[rowIdx][colIdx] = new Array(maximumPossibleSum).fill(false);
        }
    }
    
    dynamicProgrammingTable[0][0][valueGrid[0][0]] = true;

    for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
            if (rowIdx === 0 && colIdx === 0) {
                continue;
            }

            if (rowIdx === 0) {
                for (var sumVal = 0; sumVal < maximumPossibleSum; sumVal++) {
                    if (dynamicProgrammingTable[rowIdx][colIdx - 1][sumVal]) {
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal + valueGrid[rowIdx][colIdx])] = true;
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal - valueGrid[rowIdx][colIdx])] = true;
                    }
                }
            } else if (colIdx === 0) {
                for (var sumVal = 0; sumVal < maximumPossibleSum; sumVal++) {
                    if (dynamicProgrammingTable[rowIdx - 1][colIdx][sumVal]) {
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal + valueGrid[rowIdx][colIdx])] = true;
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal - valueGrid[rowIdx][colIdx])] = true;
                    }
                }
            } else {
                for (var sumVal = 0; sumVal < maximumPossibleSum; sumVal++) {
                    if (dynamicProgrammingTable[rowIdx - 1][colIdx][sumVal]) {
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal + valueGrid[rowIdx][colIdx])] = true;
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal - valueGrid[rowIdx][colIdx])] = true;
                    }
                    if (dynamicProgrammingTable[rowIdx][colIdx - 1][sumVal]) {
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal + valueGrid[rowIdx][colIdx])] = true;
                        dynamicProgrammingTable[rowIdx][colIdx][Math.abs(sumVal - valueGrid[rowIdx][colIdx])] = true;
                    }
                }
            }
        }
    }

    for (var finalSum = 0; finalSum < maximumPossibleSum; finalSum++) {
        if (dynamicProgrammingTable[gridHeight - 1][gridWidth - 1][finalSum]) {
            printResult(finalSum);
            return;
        }
    }
}