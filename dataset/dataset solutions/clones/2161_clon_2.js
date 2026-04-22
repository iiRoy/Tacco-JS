const sourceData = require("fs") .readFileSync("/dev/stdin", "utf8") .trim() .split("\n");

const dataIterator = {
    // Stores the array of lines read from input.
    "contents" : sourceData,

    "position" : 0, // Current position within the array.
    "limit" : sourceData.length, // Total number of lines.

    /**
     * Retrieves the next item from the input sequence and advances the position.
     * @returns {string} The next available line.
     * @throws {string} If no more elements are available.
     */
    "retrieveNext" : function() {
        if (!this.hasMore()) {
            throw "ElementRetrievalFailure: No further elements exist.";
        }
        let currentElement = this.contents[this.position];
        this.position++;
        return currentElement;
    },

    /**
     * Checks if there are more elements left to process in the sequence.
     * @returns {boolean} True if more elements are available, false otherwise.
     */
    "hasMore" : function() {
        return (this.position < this.limit);
    }
};

ExecuteCoreFunction();

/**
 * Global helper function to fetch the next line from the input iterator.
 * @returns {string} The next line.
 */
function fetchNextItem() {
    return dataIterator.retrieveNext();
}

/**
 * Global helper function to check if more lines are available in the input.
 * @returns {boolean} True if more lines, false otherwise.
 */
function queryAvailability() {
    return dataIterator.hasMore();
}

/**
 * Outputs a given message to the standard console.
 * @param {any} message - The content to be displayed.
 */
function displayResult(message) {
    console.log(message);
}

/**
 * Reports an error message to the standard error console.
 * @param {any} issueDetails - The error details to be reported.
 */
function reportError(issueDetails) {
    console.error(issueDetails);
}

// This utility function manages data transformations based on a mode code.
// For unrecognized or problematic modes, input is returned unaltered.
// Mode 1: String to integer conversion.
// Mode 2: String to array of strings, delimited by single space.
// Mode 4: String to array of numbers, delimited by single space.
// Mode 6: String to array of single characters.
// Mode 7: String to array of numbers, from single characters.
// Mode 8: Array of strings to single string, joined by space.
// Mode 9: Array of strings to single string, joined by newline.
// Mode 0: Array of strings to single string, joined without separator.
function transformValue(itemToProcess, operationType) {
    try {
        switch (operationType) {
            case 1:
                return parseInt(itemToProcess);
            case 2:
                return itemToProcess.split(" ");
            case 4:
                return itemToProcess.split(" ").map((valStr) => Number(valStr));
            case 6:
                return itemToProcess.split("");
            case 7:
                return itemToProcess.split("").map((valStr) => Number(valStr));
            case 8:
                return itemToProcess.join(" ");
            case 9:
                return itemToProcess.join("\n");
            case 0:
                return itemToProcess.join("");
            default:
                return itemToProcess;
        }
    } catch (exception) {
        return itemToProcess;
    }
}

/**
 * The primary function containing the core business logic.
 * It processes a sequence of numbers and calculates a specific sum.
 */
function ExecuteCoreFunction() {
    let numericSequence = transformValue(fetchNextItem(), 7); // Get input line, convert to array of numbers from chars
    const sequenceLength = numericSequence.length;
    let calculatedResult = 0;

    for (let idx = sequenceLength - 1; idx >= 0; idx--) {
        if (numericSequence[idx] >= 6) {
            calculatedResult += 10 - numericSequence[idx];
            numericSequence[idx] = 0;
            if (idx !== 0) {
                numericSequence[idx - 1]++;
            } else {
                calculatedResult++;
            }
        } else {
            calculatedResult += numericSequence[idx];
        }
    }

    displayResult(calculatedResult);
}