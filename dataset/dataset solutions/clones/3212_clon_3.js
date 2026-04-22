const DataStreamHandler = (function() {
    /**
     * A factory function to create a new input stream parser instance.
     * This acts as the entry point for consuming raw input data.
     *
     * @param {string} rawInputString The complete input content as a single string.
     * @returns {StreamDataProcessor} An instance of the data processor.
     */
    function createParserInstance(rawInputString) {
        return new StreamDataProcessor(rawInputString);
    }

    /**
     * The core class responsible for processing input content line by line and token by token.
     * It maintains an internal pointer to track the current reading position.
     */
    class StreamDataProcessor {
        #sourceLines;          // Private field: Stores the input content, split into an array of lines.
        #currentLinePointer;   // Private field: Tracks the index of the current line being processed.

        /**
         * Constructs a new StreamDataProcessor.
         *
         * @param {string} inputContent The raw string content to be parsed.
         */
        constructor(inputContent) {
            // Validate input content and initialize the source lines.
            if (typeof inputContent !== 'string' || inputContent.trim().length === 0) {
                this.#sourceLines = [];
                console.warn("InputProcessor: Provided input content is empty or not a string. Initializing with empty buffer.");
            } else {
                this.#sourceLines = inputContent.trim().split("\n");
            }
            this.#currentLinePointer = 0; // Start reading from the first line.
        }

        /**
         * Extracts and returns a single token (word) from the current line.
         * Tokens are separated by spaces. If the current line is exhausted, it moves to the next.
         *
         * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, as a number.
         * @returns {string|number|null|NaN} The extracted token, or null/NaN if no token could be read.
         */
        extractNextToken(returnAsString = false) {
            // Check if we've read past the end of the input stream.
            if (this.#currentLinePointer >= this.#sourceLines.length) {
                console.error("InputProcessor: Attempted to read beyond the end of the input stream.");
                return returnAsString ? null : NaN;
            }

            let currentLineData = this.#sourceLines[this.#currentLinePointer];

            // If the current line hasn't been tokenized into an array yet, do so now.
            // We reverse it to efficiently use `pop()` for token extraction.
            if (typeof currentLineData === 'string') {
                const tokens = currentLineData.split(" ").filter(t => t.length > 0); // Filter out empty strings from multiple spaces
                this.#sourceLines[this.#currentLinePointer] = tokens.reverse();
                currentLineData = this.#sourceLines[this.#currentLinePointer];
            }

            // Ensure we have tokens to process on the current line.
            if (!Array.isArray(currentLineData) || currentLineData.length === 0) {
                this.#currentLinePointer++; // Move to the next line if current is empty.
                return returnAsString ? null : NaN;
            }

            const tokenValue = currentLineData.pop(); // Get the last token.

            // If the line is now empty after popping, advance to the next line.
            if (currentLineData.length === 0) {
                this.#currentLinePointer++;
            }

            return returnAsString ? tokenValue : Number(tokenValue);
        }

        /**
         * Reads an entire line from the input stream and processes its space-separated values.
         * The line pointer is advanced after reading.
         *
         * @param {boolean} [returnAsStrings=false] If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of values from the line. Returns an empty array if no line is available.
         */
        fetchLineAsNumbers(returnAsStrings = false) {
            if (this.#currentLinePointer >= this.#sourceLines.length) {
                console.error("InputProcessor: No more lines to fetch from the input stream.");
                return [];
            }

            // Get the line content and advance the pointer.
            const rawLineContent = this.#sourceLines[this.#currentLinePointer++];
            const lineTokens = String(rawLineContent).split(" ").filter(t => t.length > 0); // Ensure string and filter empty tokens

            return returnAsStrings ? lineTokens : lineTokens.map(val => Number(val));
        }

        /**
         * Collects a specified number of lines, splitting each into space-separated values,
         * and returns them as a 2D array (matrix).
         * The line pointer is advanced by `linesToCollect`.
         *
         * @param {number} linesToCollect The number of lines to read.
         * @param {boolean} [returnAsStrings=false] If true, returns a 2D array of strings; otherwise, numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the collected data.
         */
        collectMultiLineData(linesToCollect, returnAsStrings = false) {
            if (linesToCollect <= 0) {
                console.warn("InputProcessor: Request to collect zero or negative lines. Returning empty array.");
                return [];
            }

            let actualLinesToRead = Math.min(linesToCollect, this.#sourceLines.length - this.#currentLinePointer);
            if (actualLinesToRead < linesToCollect) {
                console.warn(`InputProcessor: Requested ${linesToCollect} lines, but only ${actualLinesToRead} lines remain. Reading available lines.`);
            }
            if (actualLinesToRead === 0) return [];

            const collectedData = [];
            for (let i = 0; i < actualLinesToRead; i++) {
                const currentLineContent = this.#sourceLines[this.#currentLinePointer++];
                const lineTokens = String(currentLineContent).split(" ").filter(t => t.length > 0);
                collectedData.push(returnAsStrings ? lineTokens : lineTokens.map(val => Number(val)));
            }
            return collectedData;
        }

        /**
         * Reads a specified number of lines and returns them as a 1D array of numbers.
         * Each line is expected to contain a single number.
         * The line pointer is advanced by `linesToRead`.
         *
         * @param {number} linesToRead The number of lines to read.
         * @param {boolean} [returnAsStrings=false] If true, returns an array of strings; otherwise, numbers.
         * @returns {Array<string|number>} A 1D array of values.
         */
        grabNumberArray(linesToRead, returnAsStrings = false) {
            if (linesToRead <= 0) {
                console.warn("InputProcessor: Request to grab zero or negative lines. Returning empty array.");
                return [];
            }

            let actualLinesToRead = Math.min(linesToRead, this.#sourceLines.length - this.#currentLinePointer);
            if (actualLinesToRead < linesToRead) {
                console.warn(`InputProcessor: Requested ${linesToRead} lines, but only ${actualLinesToRead} lines remain. Grabbing available lines.`);
            }
            if (actualLinesToRead === 0) return [];

            const processedLines = this.#sourceLines.slice(this.#currentLinePointer, this.#currentLinePointer + actualLinesToRead);
            this.#currentLinePointer += actualLinesToRead; // Advance pointer.

            return returnAsStrings ? processedLines : processedLines.map(line => Number(line));
        }
    }

    return createParserInstance;
})();

// --- Main Application Logic ---

// Variable to hold the raw input content.
let applicationInputBuffer;

// Attempt to read input from standard input using Node.js 'fs' module.
// Includes a fallback mechanism for local testing or when stdin is unavailable.
try {
    applicationInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    // Trim any leading/trailing whitespace from the entire input buffer.
    applicationInputBuffer = applicationInputBuffer.trim();
    if (applicationInputBuffer.length === 0) {
        throw new Error("Standard input is empty.");
    }
} catch (error) {
    console.error("Critical Error: Failed to read from /dev/stdin. Details:", error.message);
    // Provide a sample input for demonstration or local development if stdin fails.
    applicationInputBuffer = "5\n1\n0\n1\n0\n1"; // Example: 5 elements: 1, 0, 1, 0, 1
    console.log("Using a predefined dummy input for execution:", JSON.stringify(applicationInputBuffer));
}

// Instantiate the input parser with the collected input.
const inputParser = DataStreamHandler(applicationInputBuffer);

// Execute the primary algorithm and output its computed result to the console.
console.log(executeDynamicProgrammingSolution());

/**
 * Implements the main dynamic programming algorithm to find the minimum cost.
 * This function encapsulates the core logic of the problem.
 *
 * @returns {number} The minimum total cost calculated by the algorithm.
 */
function executeDynamicProgrammingSolution() {
    // Read the total number of elements that will follow.
    const numberOfInputElements = inputParser.extractNextToken();

    // Validate the number of elements.
    if (isNaN(numberOfInputElements) || numberOfInputElements <= 0) {
        console.error("Algorithm Error: Invalid or non-positive number of elements specified in input. Returning 0 (or appropriate error code).");
        return 0;
    }

    // Read the sequence of numbers that the algorithm will process.
    const elementSequence = inputParser.grabNumberArray(numberOfInputElements);

    // Perform a sanity check on the actual number of elements read.
    if (elementSequence.length !== numberOfInputElements) {
        console.warn(`Algorithm Warning: Expected ${numberOfInputElements} elements, but only read ${elementSequence.length}. Proceeding with available data.`);
    }
    if (elementSequence.length === 0) {
        return 0; // Base case: If no elements to process, cost is 0.
    }

    // `minPathCosts` is a DP array where `minPathCosts[j]` stores the minimum cost
    // to reach the current element, ending in state `j`. There are 5 possible states (0-4).
    let minPathCosts = new Array(5).fill(Number.POSITIVE_INFINITY);

    // Initialize the DP array for the very first element in the sequence.
    // The cost for the first element depends on its value and the target state.
    const firstElementValue = elementSequence[0];
    for (let stateIndex = 0; stateIndex < 5; stateIndex++) {
        minPathCosts[stateIndex] = calculateStateTransitionWeight(firstElementValue, stateIndex);
    }

    // Iterate through the remaining elements (from the second element onwards).
    for (let currentElementIdx = 1; currentElementIdx < numberOfInputElements; currentElementIdx++) {
        const currentElementValue = elementSequence[currentElementIdx];
        // `nextIterationCosts` will temporarily store the minimum costs for the current `currentElementIdx`.
        let nextIterationCosts = new Array(5).fill(Number.POSITIVE_INFINITY);

        // Special handling for the target state 0:
        // This is a direct transition, simply adding the current element's value to the previous state 0 cost.
        nextIterationCosts[0] = minPathCosts[0] + currentElementValue;

        // For other target states (1 through 4), we consider transitions from all relevant previous states.
        for (let targetState = 1; targetState < 5; targetState++) {
            for (let previousState = 0; previousState <= targetState; previousState++) {
                // Calculate a candidate cost: sum of the minimum cost to reach `previousState`
                // and the weight/cost to transition from `previousState` to `targetState` using `currentElementValue`.
                const candidateCost = minPathCosts[previousState] + calculateStateTransitionWeight(currentElementValue, targetState);
                // Update the minimum cost for the `targetState` if this candidate is lower.
                nextIterationCosts[targetState] = Math.min(nextIterationCosts[targetState], candidateCost);
            }
        }
        // After processing the current element, update `minPathCosts` for the next iteration.
        minPathCosts = nextIterationCosts;
    }

    // Once all elements have been processed, the overall minimum cost is the smallest value
    // within the final `minPathCosts` array.
    return Math.min(...minPathCosts);

    /**
     * A crucial helper function that determines the specific weight or cost associated
     * with an element's value when transitioning to a particular state (cost category).
     * This function's logic defines the problem's cost structure.
     *
     * @param {number} inputValue The numerical value of the current element from the sequence.
     * @param {number} costCategory The target cost category or state (an integer from 0 to 4).
     * @returns {number} The calculated weight/cost for the given input value and category.
     */
    function calculateStateTransitionWeight(inputValue, costCategory) {
        // A guard clause for invalid categories, although algorithm should ensure 0-4.
        if (costCategory < 0 || costCategory > 4) {
            console.error(`Weight Calculation Error: Received an out-of-bounds cost category: ${costCategory}.`);
            return Number.POSITIVE_INFINITY; // Indicate an invalid transition cost.
        }

        switch (costCategory) {
            case 0:
            case 4:
                // For categories 0 and 4, the weight is simply the element's value itself.
                return inputValue;
            case 2:
                // For category 2, the weight is (value + 1) modulo 2.
                // This effectively flips 0 to 1, 1 to 0, if inputValue is 0 or 1.
                return (inputValue + 1) % 2;
            case 1:
            case 3:
                // For categories 1 and 3, if the value is 0, the weight is 2.
                // Otherwise, the weight is the value modulo 2.
                // Assuming typical input values for this case are 0 or 1.
                return inputValue === 0 ? 2 : inputValue % 2;
            default:
                // This case should ideally not be reached due to the initial bounds check,
                // but included for robustness.
                console.warn(`Weight Calculation Warning: Unhandled cost category: ${costCategory}. Returning default large value.`);
                return Number.POSITIVE_INFINITY;
        }
    }
}