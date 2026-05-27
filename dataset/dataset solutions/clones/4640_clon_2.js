let inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let dataHandler;
let inputLines = [];

inputReader.on('line', function(currentInputLine) {
    inputLines.push(currentInputLine);
});

inputReader.on('close', function() {
    dataHandler = initializeInputProcessor(inputLines);
    console.error("\n");

    let startTime = new Date();
    executeMainLogic();
    let elapsedTime = new Date() - startTime;

    logDebugMessage("time : " + (elapsedTime) + "ms");
    logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} sourceObject The object to clone.
 * @returns {object} A new, deep-copied object.
 */
function createDeepCopy(sourceObject) {
    return JSON.parse(JSON.stringify(sourceObject));
}

// Helper functions to fetch and convert input data
function getNextInteger() { return convertInput(fetchNextLine(), 1); }
function getNextStringArray() { return convertInput(fetchNextLine(), 2); }
function getNextIntegerArray() { return convertInput(fetchNextLine(), 4); }
function getNextCharacterArray() { return convertInput(fetchNextLine(), 6); }

// Functions to interact with the input data handler
function fetchNextLine() { return dataHandler.next(); }
function hasMoreLines() { return dataHandler.hasNext(); }

/**
 * Initializes an input processor object from an array of lines.
 * This object provides methods to check for more lines and retrieve the next line.
 * @param {string[]} sourceInputLines An array of strings, where each string is a line of input.
 * @returns {object} An object with `hasMoreLines` and `next` methods.
 */
function initializeInputProcessor(sourceInputLines) {
    let processorInstance = {
        sourceLines: sourceInputLines,
        currentLineIndex: 0,
        totalLines: sourceInputLines.length,
        hasMoreLines: function() {
            return (this.currentLineIndex < this.totalLines);
        },
        next: function() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException これ以上ないよ";
            } else {
                let fetchedLine = this.sourceLines[this.currentLineIndex];
                this.currentLineIndex++;
                return fetchedLine;
            }
        }
    };
    return processorInstance;
}

/**
 * Prints a message to standard output.
 * @param {*} messageContent The content to print.
 */
function printResult(messageContent) {
    console.log(messageContent);
}

/**
 * Logs a debug message to standard error, formatted for inspection.
 * @param {*} messageContent The content to log.
 */
function logDebugMessage(messageContent) {
    console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Converts an input value based on a specified type.
 * @param {*} inputValue The value to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into number array.
 *   6: Split by character into string array.
 *   7: Split by character into number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 * @returns {*} The converted value or the original input on error.
 */
function convertInput(inputValue, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return parseInt(inputValue);
            case 2:
                return inputValue.split(" ");
            case 4:
                return inputValue.split(" ").map(Number);
            case 6:
                return inputValue.split("");
            case 7:
                return inputValue.split("").map(Number);
            case 8:
                return inputValue.join(" ");
            case 9:
                return inputValue.join("\n");
            case 0:
                return inputValue.join("");
            default:
                return inputValue;
        }
    } catch (conversionError) {
        return inputValue;
    }
}

/**
 * The main function containing the core logic of the application.
 * It reads input, performs calculations, and prints the final result.
 */
function executeMainLogic() {
    let firstLineData = getNextIntegerArray();
    let numElements = firstLineData[0];
    let minSelectedCount = firstLineData[1];

    let originalNumbers = getNextIntegerArray();
    let minimumCost = Math.pow(10, 16);

    if (minSelectedCount === 1) {
        printResult(0);
        return;
    }

    for (let outerLoopIndex = 0; outerLoopIndex < (1 << numElements); outerLoopIndex++) {
        let currentSelection = [originalNumbers[0]];

        for (let innerLoopIndex = 1; innerLoopIndex < numElements; innerLoopIndex++) {
            if ((outerLoopIndex & (1 << innerLoopIndex)) !== 0) {
                currentSelection.push(originalNumbers[innerLoopIndex]);
            }
        }

        if (currentSelection.length >= minSelectedCount) {
            let currentCost = 0;
            for (let innerLoopIndex = 1; innerLoopIndex < currentSelection.length; innerLoopIndex++) {
                if (currentSelection[innerLoopIndex - 1] >= currentSelection[innerLoopIndex]) {
                    let requiredIncrease = currentSelection[innerLoopIndex - 1] - currentSelection[innerLoopIndex] + 1;
                    currentCost += requiredIncrease;
                    currentSelection[innerLoopIndex] = currentSelection[innerLoopIndex - 1] + 1;
                }
            }
            minimumCost = Math.min(minimumCost, currentCost);
        }
    }
    printResult(minimumCost);
}
