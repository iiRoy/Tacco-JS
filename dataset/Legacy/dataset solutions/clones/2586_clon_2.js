var INPUT_PARSER = (function() {
    /**
     * Creates a new input reader instance.
     * @param {string} sourceText - The raw input string.
     * @returns {InputReader} A new input reader object.
     */
    function createParser(sourceText) {
        return new InputReader(sourceText);
    }

    /**
     * Handles parsing of multi-line string input.
     * @class
     * @param {string} rawInputString - The complete string input.
     */
    function InputReader(rawInputString) {
        // Store input lines, trimmed and split by newline.
        this._sourceLines = rawInputString.trim().split("\n");
        // Current line index being processed.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next item from the current line. If the line is exhausted, moves to the next.
     * Items are read from right to left (reversed).
     * @param {boolean} [returnAsString=false] - If true, returns the item as a string; otherwise, as a number.
     * @returns {string|number} The parsed item.
     */
    InputReader.prototype.readNextItem = function(returnAsString) {
        var currentLineParts = this._sourceLines,
            linePointer = this._currentLineIndex,
            extractedValue;

        // If the current line hasn't been split and reversed yet, do it.
        if (typeof currentLineParts[linePointer] === "string") {
            currentLineParts[linePointer] = currentLineParts[linePointer].split(" ").reverse();
        }

        // Pop the last item (which is the first item in original order due to reverse).
        extractedValue = currentLineParts[linePointer].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLineParts[linePointer].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return returnAsString ? extractedValue : +extractedValue;
    };

    /**
     * Reads all items from the current line, then advances to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed items from the line.
     */
    InputReader.prototype.readLineItems = function(returnAsString) {
        // Get the current line, split by space, and advance the line pointer.
        var lineItems = this._sourceLines[this._currentLineIndex++].split(" ");
        // Return as strings or convert all to numbers.
        return returnAsString ? lineItems : lineItems.map(itemStr => +itemStr);
    };

    /**
     * Reads a block of 'numLines' lines, parsing each into an array of items.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed items.
     */
    InputReader.prototype.readMatrix = function(numLines, returnAsString) {
        // Slice the relevant lines, split each by space.
        var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines).map(rowStr => rowStr.split(" "));
        // Return as strings or convert all inner items to numbers.
        return returnAsString ? matrixRows : matrixRows.map(row => row.map(cellStr => +cellStr));
    };

    /**
     * Reads a block of 'numLines' lines as raw strings or numbers.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of raw lines.
     */
    InputReader.prototype.readRawLines = function(numLines, returnAsString) {
        // Slice the relevant lines.
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        // Return as strings or convert all to numbers.
        return returnAsString ? rawLines : rawLines.map(lineStr => +lineStr);
    };

    return createParser;
})();

// Initialize the input parser with data from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The multi-dimensional array.
 */
function initializeMultiDimArray(initialValue) {
    var dimensionArgs = arguments,
        dimensionCount = dimensionArgs.length,
        arrayCreationString = "Array(dimensionArgs[" + --dimensionCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

    // Build the string for nested Array.fill().map() calls.
    while (--dimensionCount) {
        arrayCreationString = "Array(dimensionArgs[" + dimensionCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }

    // Use eval to create the array dynamically.
    return eval(arrayCreationString);
}

// Declare global variables for program state.
var itemCount, sortedValues, availabilityMap;

// Execute the main program logic and print the result to console.
console.log(executeProgram());

/**
 * Main execution function of the program.
 * Reads input, sorts data, initializes state, and starts the search.
 * @returns {string} "Yes" or "No" based on the search result.
 */
function executeProgram() {
    // Read the number of items.
    itemCount = inputData.readNextItem();
    // Read the list of values.
    sortedValues = inputData.readLineItems();

    // Sort the values in descending order.
    sortedValues.sort((valA, valB) => valB - valA);

    // Initialize a boolean array (or bitmask array) of size 2^itemCount.
    // This array tracks the availability/usage of combinations.
    availabilityMap = initializeMultiDimArray(0, 1 << itemCount);
    // Mark the first state as available/visited.
    availabilityMap[0] = 1;

    // Start the breadth-first search-like process.
    // The initial state is the first sorted value with a count of 1.
    return exploreCombinations([[sortedValues[0], 1]]) ? "Yes" : "No";
}

/**
 * Performs a recursive search to find if a specific combination is possible.
 * This function behaves like a breadth-first search or a recursive backtracking with memoization.
 * @param {Array<Array<number>>} currentStates - An array of [value, index] pairs representing current states/nodes.
 * @returns {number} 1 if a valid combination is found, 0 otherwise.
 */
function exploreCombinations(currentStates) {
    var currentStatesLength = currentStates.length;
    var mapLength = availabilityMap.length;

    // Base case: If the number of current states equals the total possible states,
    // it means a valid combination has been built.
    if (currentStatesLength === mapLength) {
        return 1;
    }

    // Initialize the queue for the next level of states with the current states.
    var nextStatesQueue = currentStates.concat();
    // Initialize a candidate index, starting from 1.
    var candidateIndex = 1;

    // Iterate through each state in the current level.
    for (var stateIterator = 0; stateIterator < currentStatesLength; stateIterator++) {
        // Ensure candidateIndex is at least the index from the current state.
        if (candidateIndex < currentStates[stateIterator][1]) {
            candidateIndex = currentStates[stateIterator][1];
        }

        // Search for an available value in 'sortedValues' that meets the condition.
        // 'candidateIndex' iterates through 'availabilityMap' and 'sortedValues'.
        for (; candidateIndex < mapLength; candidateIndex++) {
            // If this state (index) is already used/visited, skip it.
            if (availabilityMap[candidateIndex]) {
                continue;
            }
            // If the current sorted value is less than the value of the current state,
            // it means we've passed the point where a valid match could be found for this state.
            if (sortedValues[candidateIndex] < currentStates[stateIterator][0]) {
                break;
            }
        }

        // If no suitable candidate was found for the current state, then this path is invalid.
        if (candidateIndex === mapLength) {
            return 0;
        }

        // Mark the found candidate state as used/visited.
        availabilityMap[candidateIndex] = 1;
        // Add the new state (value and next index) to the queue for the next level.
        nextStatesQueue.push([sortedValues[candidateIndex], ++candidateIndex]);
    }

    // Recursively call the function with the new set of states, sorted by value in descending order.
    return exploreCombinations(nextStatesQueue.sort((pairA, pairB) => pairB[0] - pairA[0]));
}
