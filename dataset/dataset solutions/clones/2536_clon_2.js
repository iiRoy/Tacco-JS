/* This module facilitates parsing multi-line string input into structured data. */
const DATA_PARSER_MODULE = (function () {
    /**
     * Factory function to create a new input data processor.
     * @param {string} inputStringContent - The entire input as a single string.
     * @returns {DataProcessor} An instance of DataProcessor.
     */
    function createDataProcessor(inputStringContent) {
        return new DataProcessor(inputStringContent);
    }

    /**
     * Class responsible for processing and accessing lines of input data.
     */
    class DataProcessor {
        /**
         * Constructs a DataProcessor instance.
         * @param {string} rawInputText - The raw string input.
         */
        constructor(rawInputText) {
            // Internal storage for parsed lines.
            this._textLines = rawInputText.trim().split("\n");
        }

        /**
         * Retrieves a specific line value directly.
         * @param {number} lineIdx - The zero-based index of the line.
         * @returns {string} The content of the specified line.
         */
        getLineValue(lineIdx) {
            return this._textLines[lineIdx];
        }

        /**
         * Parses a specific line into an array of values, converting numbers where possible.
         * @param {number} lineNum - The zero-based index of the line.
         * @returns {Array<number|string>} An array of parsed values from the line.
         */
        getLineAsArray(lineNum) {
            return this.convertStringToArray(this._textLines[lineNum]);
        }

        /**
         * Extracts a range of lines and processes each line into a number or string.
         * @param {number} startIdx - The starting zero-based index for the slice.
         * @param {number} lineCount - The number of lines to extract.
         * @returns {Array<number|string>} An array of parsed values from the sliced lines.
         */
        extractLines(startIdx, lineCount) {
            return this._textLines
                .slice(startIdx, +lineCount + startIdx || undefined)
                .map(itemStr => this.parseValue(itemStr));
        }

        /**
         * Extracts a range of lines and processes each line into an array of values.
         * @param {number} startIdx - The starting zero-based index for the slice.
         * @param {number} lineCount - The number of lines to extract.
         * @returns {Array<Array<number|string>>} An array of arrays, each representing a parsed line.
         */
        extractLinesAsArrays(startIdx, lineCount) {
            return this._textLines
                .slice(startIdx, +lineCount + startIdx || undefined)
                .map(itemStr => this.convertStringToArray(itemStr));
        }

        /**
         * Converts a space-separated string into an array of parsed values.
         * @param {string} inputLine - The string to convert.
         * @returns {Array<number|string>} An array of parsed values.
         */
        convertStringToArray(inputLine) {
            return inputLine.split(" ").map(itemStr => this.parseValue(itemStr));
        }

        /**
         * Attempts to convert a string to a number; otherwise, returns the original string.
         * @param {string} strValue - The string value to parse.
         * @returns {number|string} The parsed number or the original string.
         */
        parseValue(strValue) {
            const numericValue = +strValue;
            // Check if the conversion resulted in a valid number (not NaN)
            return (numericValue === numericValue) ? numericValue : strValue;
        }
    }

    return createDataProcessor; // Export the factory function
})();

// Read input from standard in and process it using our custom parser.
const problemInput = DATA_PARSER_MODULE(require("fs").readFileSync("/dev/stdin", "utf8"));

// Utility object for printing results to the console.
const outputResult = {
    print: function (content) {
        console.log(content);
    }
};

/**
 * Creates a multi-dimensional array initialized with a default value.
 * This function uses `eval`, exercise caution.
 * @param {*} defaultValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function initializeMultiDimensionalArray(defaultValue, ...dimensions) {
    let currentLength = dimensions.length;
    let arrayDefinitionString = `Array(dimensions[${--currentLength}]).fill(0).map(x => { return ${defaultValue}; })`;
    while (--currentLength >= 0) {
        arrayDefinitionString = `Array(dimensions[${currentLength}]).fill(0).map(x => ${arrayDefinitionString})`;
    }
    return eval(arrayDefinitionString);
}


// Execute the main problem-solving function and print its result.
outputResult.print(solveProblem());

/**
 * Main function containing the problem's solution logic.
 * This function calculates the minimum cost to satisfy all conditions using dynamic programming.
 * @returns {number} The calculated minimum cost, or -1 if satisfying all conditions is impossible.
 */
function solveProblem() {
    // Read the first line which contains N (total elements) and M (number of conditions).
    const firstLineDataSegments = problemInput.getLineAsArray(0);
    const totalElements = firstLineDataSegments[0]; // Represents N in the original problem
    const numConditions = firstLineDataSegments[1]; // Represents M in the original problem

    // Read subsequent lines containing condition details.
    // Each condition consists of two lines: cost and a list of elements it covers.
    const conditionDetails = problemInput.extractLinesAsArrays(1);

    // This block calculates a sum, but its result is not used later in the logic.
    // It's retained to maintain structural identity with the original code.
    let initialBitmaskSum = 0;
    for (let currentBit = totalElements; currentBit > 0; currentBit--) {
        initialBitmaskSum += 1 << currentBit;
    }

    // Process condition details into a more usable array of objects.
    const processedConditions = [];
    for (let detailIndex = 0; numConditions * 2 > detailIndex; detailIndex = detailIndex + 2) {
        processedConditions.push({
            costValue: conditionDetails[detailIndex][0], // The cost associated with this condition
            // Calculate a bitmask representing the elements covered by this condition.
            // Each element 'c' (1-indexed) corresponds to a bit at position (c-1).
            coveredElementsMask: conditionDetails[detailIndex + 1].reduce(function (currentAccumulator, conditionBit) {
                return currentAccumulator | (1 << (conditionBit - 1));
            }, 0)
        });
    }

    // Dynamic programming array: minimumCosts[state] stores the minimum cost
    // to reach the 'state' (a bitmask representing covered elements).
    const minimumCosts = (new Array(1 << totalElements)).fill(Infinity);
    minimumCosts[0] = 0; // The cost to cover no elements (state 0) is zero.

    // Iterate through all possible states from 0 to (2^totalElements - 1).
    for (let currentBitmaskState = 0; (1 << totalElements) > currentBitmaskState; currentBitmaskState++) {
        // For each current state, try applying every available condition.
        for (let conditionIterator = 0; numConditions > conditionIterator; conditionIterator++) {
            // Calculate the next state by ORing the current state with the condition's covered elements mask.
            const nextBitmaskState = currentBitmaskState | processedConditions[conditionIterator].coveredElementsMask;
            // Calculate the cost to reach this next state via the current path.
            const calculatedCost = minimumCosts[currentBitmaskState] + processedConditions[conditionIterator].costValue;

            // If this path offers a lower cost to reach 'nextBitmaskState', update it.
            minimumCosts[nextBitmaskState] = Math.min(minimumCosts[nextBitmaskState], calculatedCost);
        }
    }

    // The final desired state is when all 'totalElements' are covered,
    // which is a bitmask with all 'totalElements' bits set to 1.
    const finalDesiredState = (1 << totalElements) - 1;

    // Return the minimum cost for the final state. If it's still Infinity, it means
    // the state is unreachable, so return -1 as per problem convention.
    return minimumCosts[finalDesiredState] === Infinity ? -1 : minimumCosts[finalDesiredState];
}