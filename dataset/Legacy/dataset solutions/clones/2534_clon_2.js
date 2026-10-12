var INPUT_PARSER_FACTORY = (function() {
    /**
     * Creates an input reader instance from a raw string.
     * @param {string} rawInputString - The complete input string.
     * @returns {InputDataProcessor} An instance of InputDataProcessor.
     */
    function createInputReader(rawInputString) {
        return new InputDataProcessor(rawInputString);
    }

    /**
     * Constructor for the InputDataProcessor.
     * Initializes the internal state for reading lines and values.
     * @param {string} initialStringContent - The string containing all input data.
     */
    function InputDataProcessor(initialStringContent) {
        // Split the input string into an array of lines, after trimming whitespace.
        this.processedLines = initialStringContent.trim().split("\n");
        // Initialize a pointer to the current line being processed.
        this.currentLinePointer = 0;
    }

    /**
     * Reads a single value (number or string) from the current line.
     * If the current line is exhausted, it moves to the next line.
     * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The extracted value.
     */
    InputDataProcessor.prototype.readSingleValue = function(asString) {
        var lineBuffer = this.processedLines;
        var lineIndex = this.currentLinePointer;
        var extractedToken;

        // If the current line hasn't been split into tokens yet, do so.
        // The tokens are stored in reverse order for efficient popping.
        if (typeof lineBuffer[lineIndex] === "string") {
            lineBuffer[lineIndex] = lineBuffer[lineIndex].split(" ").reverse();
        }

        // Extract the last token from the current line's buffer.
        extractedToken = lineBuffer[lineIndex].pop();

        // If the current line is now empty, advance the line pointer.
        if (!lineBuffer[lineIndex].length) {
            this.currentLinePointer++;
        }

        // Return the token, converting to number if 'asString' is false.
        return asString ? extractedToken : +extractedToken;
    };

    /**
     * Reads the entire current line and returns its space-separated values.
     * Advances the line pointer after reading.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values from the line.
     */
    InputDataProcessor.prototype.readEntireLine = function(asString) {
        // Get the current line, split by space, and advance the line pointer.
        var lineValues = this.processedLines[this.currentLinePointer++].split(" ");
        // Return values as strings or mapped to numbers.
        return asString ? lineValues : lineValues.map(element => +element);
    };

    /**
     * Reads a specified number of lines and parses them into a 2D array (matrix).
     * Advances the line pointer by the number of lines read.
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputDataProcessor.prototype.readMultiLineMatrix = function(numberOfLines, asString) {
        // Extract a slice of lines and map each line to an array of space-separated values.
        var matrixRows = this.processedLines.slice(this.currentLinePointer, this.currentLinePointer += numberOfLines)
                                            .map(element => element.split(" "));
        // Return the matrix, with inner values as strings or mapped to numbers.
        return asString ? matrixRows : matrixRows.map(row => row.map(element => +element));
    };

    /**
     * Reads a specified number of lines and returns them as a 1D array of values.
     * Advances the line pointer by the number of lines read.
     * @param {number} numberOfLines - The count of lines to read.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of values from the lines.
     */
    InputDataProcessor.prototype.readMultipleLines = function(numberOfLines, asString) {
        // Extract a slice of lines.
        var lineData = this.processedLines.slice(this.currentLinePointer, this.currentLinePointer += numberOfLines);
        // Return the lines, with values as strings or mapped to numbers.
        return asString ? lineData : lineData.map(element => +element);
    };

    return createInputReader; // The factory function is returned.
})();

// Initialize the input reader by reading from standard input.
var inputReaderInstance = INPUT_PARSER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a default value.
 * The dimensions are passed as additional arguments.
 * Example: initializeMultiDimensionalArray(0, 2, 3) creates a 2x3 array filled with 0s.
 * @param {*} defaultValue - The value to initialize each element with.
 * @param {...number} dimensionsList - The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(defaultValue) {
    var dimensionsList = arguments; // Access all arguments including defaultValue.
    var dimCounter = dimensionsList.length; // Total number of arguments.
    // Start building the array creation string from the innermost dimension.
    var arrayCreationExpression = "Array(dimensionsList[" + --dimCounter + "]).fill(0).map(x=>{return " + defaultValue + ";})";
    // Loop to build up the outer dimensions.
    while (--dimCounter) {
        arrayCreationExpression = "Array(dimensionsList[" + dimCounter + "]).fill(0).map(x=>" + arrayCreationExpression + ")";
    }
    // Evaluate the constructed string to create the array.
    return eval(arrayCreationExpression);
}

// Define a large number to represent infinity for cost calculations.
var INFINITY_VALUE = 1e9;

// Output the result of the main problem-solving function.
console.log(calculateMinimumCost());

/**
 * Solves the main problem: finding the minimum cost to acquire all items.
 * This uses dynamic programming with bitmasking.
 * @returns {number} The minimum cost, or -1 if it's impossible.
 */
function calculateMinimumCost() {
    // Read the total number of distinct items (n).
    var totalItems = inputReaderInstance.readSingleValue();
    // Read the total number of available offers (m).
    var totalOffers = inputReaderInstance.readSingleValue();

    // Array to store the cost of each offer.
    var offerPrices = Array(totalOffers);
    // Array to store the bitmask representing items included in each offer.
    var offerItemBitmasks = Array(totalOffers);

    // Loop through each offer to parse its details.
    for (var offerIdx = 0; offerIdx < totalOffers; offerIdx++) {
        // Read the price of the current offer.
        offerPrices[offerIdx] = inputReaderInstance.readSingleValue();
        // Read the number of items included in this offer.
        var itemsInCurrentOffer = inputReaderInstance.readSingleValue();
        // Initialize a bitmask for the current offer to 0.
        var currentOfferBitmask = 0;

        // Loop through each item listed in the current offer.
        for (var itemIdx = 0; itemIdx < itemsInCurrentOffer; itemIdx++) {
            // Read the identifier of the item (1-indexed).
            var itemIdentifier = inputReaderInstance.readSingleValue();
            // Set the corresponding bit in the bitmask.
            // (itemIdentifier-1) converts 1-indexed item ID to 0-indexed bit position.
            currentOfferBitmask += (1 << (itemIdentifier - 1));
        }
        // Store the computed bitmask for the current offer.
        offerItemBitmasks[offerIdx] = currentOfferBitmask;
    }

    // Initialize a DP array where minCostForState[state] stores the minimum cost to achieve 'state'.
    // 'state' is a bitmask representing the set of items acquired.
    // The size of the DP array is 2^totalItems, covering all possible subsets of items.
    var minCostForState = initializeMultiDimensionalArray(INFINITY_VALUE, (1 << totalItems));
    // The cost to acquire no items (state 0) is 0.
    minCostForState[0] = 0;

    // Iterate through all possible states (subsets of items acquired so far).
    for (var currentState = 0; currentState < (1 << totalItems); currentState++) {
        // If the current state is unreachable (cost is INFINITY_VALUE), skip it.
        if (minCostForState[currentState] === INFINITY_VALUE) {
            continue;
        }

        // For each offer, try to apply it to the current state.
        for (var offerOptionIdx = 0; offerOptionIdx < totalOffers; offerOptionIdx++) {
            // Calculate the next state by OR-ing the current state with the offer's item bitmask.
            // This represents acquiring all items from the current state PLUS items from the offer.
            var nextState = currentState | offerItemBitmasks[offerOptionIdx];

            // If applying this offer leads to a cheaper way to reach 'nextState', update the cost.
            if (minCostForState[currentState] + offerPrices[offerOptionIdx] < minCostForState[nextState]) {
                minCostForState[nextState] = minCostForState[currentState] + offerPrices[offerOptionIdx];
            }
        }
    }

    // The target state is (1 << totalItems) - 1, which means all items are acquired.
    // If the cost to reach this state is still INFINITY_VALUE, it's impossible.
    // Otherwise, return the minimum cost.
    return minCostForState[(1 << totalItems) - 1] === INFINITY_VALUE ? -1 : minCostForState[(1 << totalItems) - 1];
}
