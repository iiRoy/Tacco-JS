"use strict";

// Define a common modulo constant for all calculations requiring it.
const PRIME_MODULUS = 1000000007;

/**
 * @class DataStreamProcessor
 * @description This utility class is designed to handle sequential reading of tokenized input data.
 *              It processes raw input string line by line, and then token by token within each line.
 */
function DataStreamProcessor(sourceText, tokenParserFunction) {
    // Input validation: Ensure sourceText is a non-empty string.
    if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
        console.error("DataStreamProcessor: Input source text is empty or invalid. Initializing with empty content.");
        this.inputLineBuffer = [""]; // Initialize with an empty line to prevent errors.
    } else {
        // Split the source text into individual lines.
        this.inputLineBuffer = sourceText.split("\n");
    }

    // Pointer to the current token's index within the currently processed line.
    this.currentTokenIndex = 0;
    // Pointer to the current line's index within the inputLineBuffer.
    this.currentLinePointer = 0;
    // The function used to convert string tokens into their desired data type (e.g., Number, String).
    // Defaults to the global Number constructor if not explicitly provided.
    this.tokenConverter = typeof tokenParserFunction === 'function' ? tokenParserFunction : Number;

    // A temporary buffer to hold tokens of the current line being processed.
    this.activeLineTokens = [];
    // If input was provided, immediately prepare the first line for reading.
    if (this.inputLineBuffer.length > 0) {
        this._loadNextLineIntoBuffer();
    }
}

/**
 * @private
 * @method _loadNextLineIntoBuffer
 * @description Internal helper method to load tokens from the next line into `activeLineTokens`.
 *              It trims the line, splits it by spaces, and filters out any empty tokens.
 */
DataStreamProcessor.prototype._loadNextLineIntoBuffer = function() {
    // Check if there are more lines to process.
    if (this.currentLinePointer < this.inputLineBuffer.length) {
        const rawCurrentLine = this.inputLineBuffer[this.currentLinePointer];
        // Trim whitespace from the line and split by spaces. Filter out any resulting empty strings.
        this.activeLineTokens = rawCurrentLine.trim().split(" ").filter(token => token !== '');
    } else {
        // No more lines, so the token buffer is empty.
        this.activeLineTokens = [];
    }
    // Reset the token index for the new line.
    this.currentTokenIndex = 0;
};

/**
 * @method checkAvailabilityOfData
 * @description Determines if there are any more tokens available to be read from the stream.
 * @returns {boolean} True if more tokens or lines are available, false otherwise.
 */
DataStreamProcessor.prototype.checkAvailabilityOfData = function() {
    // There's data if the current line still has tokens, OR if there are more lines in the buffer
    // that could potentially contain tokens.
    return (this.currentTokenIndex < this.activeLineTokens.length) || (this.currentLinePointer + 1 < this.inputLineBuffer.length);
};

/**
 * @method retrieveNextTokenValue
 * @description Reads and returns the next available token from the data stream.
 *              It automatically advances internal pointers (token and line cursors).
 * @returns {any | null} The parsed value of the next token, or `null` if no more tokens are found.
 */
DataStreamProcessor.prototype.retrieveNextTokenValue = function() {
    // If the current line's tokens have been exhausted, attempt to move to the next line.
    if (this.currentTokenIndex >= this.activeLineTokens.length) {
        this.currentLinePointer++; // Advance to the next line.
        this._loadNextLineIntoBuffer(); // Load the tokens for the new line.

        // After attempting to load a new line, if there are still no tokens (e.g., empty lines
        // or end of input), then no more data is available.
        if (this.activeLineTokens.length === 0 && this.currentLinePointer >= this.inputLineBuffer.length) {
            return null;
        }
    }

    // If there's a token available in the current line's buffer, process and return it.
    if (this.currentTokenIndex < this.activeLineTokens.length) {
        const valueToken = this.activeLineTokens[this.currentTokenIndex];
        this.currentTokenIndex++; // Advance the token pointer.
        return this.tokenConverter(valueToken); // Convert and return the token.
    }

    // This point should ideally not be reached if `checkAvailabilityOfData()` is used
    // before calling this method, but serves as a final safeguard.
    return null;
};

/**
 * @method processAndAdvanceLine
 * @description Reads all tokens from the current line, converts them, and then advances
 *              the stream to the beginning of the next line.
 * @returns {Array<any>} An array of parsed values from the current line. Returns an empty array
 *                       if there are no more lines.
 */
DataStreamProcessor.prototype.processAndAdvanceLine = function() {
    // If there are no more lines to process, return an empty array.
    if (this.currentLinePointer >= this.inputLineBuffer.length) {
        return [];
    }

    // Map the tokens of the active line using the configured converter function.
    const valuesFromCurrentLine = this.activeLineTokens.map(this.tokenConverter);
    this.currentLinePointer++; // Advance to the next line.
    this._loadNextLineIntoBuffer(); // Load the tokens for the new line.

    return valuesFromCurrentLine;
};


/**
 * @function orchestrateMainProcessing
 * @description This is the core logic function that processes the input, performs calculations,
 *              and outputs the final result.
 * @param {string} rawInputString The complete input received, typically from standard input.
 */
function orchestrateMainProcessing(rawInputString) {
    // Initialize our custom data stream handler to parse the input.
    const inputDataParser = new DataStreamProcessor(rawInputString);

    // Fetch the primary problem parameters: total count of elements and the initial target value.
    const datasetSize = inputDataParser.retrieveNextTokenValue();
    const primaryTarget = inputDataParser.retrieveNextTokenValue();

    // Perform basic validation on the primary input parameters.
    if (datasetSize === null || primaryTarget === null || datasetSize < 1) {
        console.error("Input Error: Dataset size or primary target value is missing or invalid.");
        return; // Terminate execution if critical input is malformed.
    }

    // Populate an array with the subsequent 'datasetSize' elements from the input stream.
    const numericElementsCollection = [];
    for (let currentElementIndex = 0; currentElementIndex < datasetSize; currentElementIndex++) {
        const fetchedElement = inputDataParser.retrieveNextTokenValue();
        if (fetchedElement === null) {
            console.error(`Input Error: Expected ${datasetSize} elements, but found only ${currentElementIndex}.`);
            return; // Terminate if expected data is missing.
        }
        numericElementsCollection.push(fetchedElement);
    }

    // Sort the collected numeric elements in ascending order.
    // This ordering is crucial for the recursive calculation logic.
    numericElementsCollection.sort((valueA, valueB) => valueA - valueB);

    // Pre-calculate factorial values modulo PRIME_MODULUS.
    // These values are often required in combinatorial problems to prevent integer overflow
    // and are stored in a cache (memoizedFactorials) for quick lookup.
    const memoizedFactorials = new Array(datasetSize + 1);
    memoizedFactorials[0] = 1; // By definition, 0! = 1.
    memoizedFactorials[1] = 1; // By definition, 1! = 1.
    for (let factorialIndex = 2; factorialIndex <= datasetSize; factorialIndex++) {
        // Calculate ( (n-1)! * n ) % MOD.
        memoizedFactorials[factorialIndex] = (memoizedFactorials[factorialIndex - 1] * factorialIndex) % PRIME_MODULUS;
    }

    /**
     * @function calculateRecursiveCombinations
     * @description A nested recursive function that computes the number of ways to achieve a certain
     *              remainder through successive modulo operations, given a count of remaining elements
     *              and a sorted set of divisors.
     * @param {number} currentWorkingRemainder The current remainder value being processed.
     * @param {number} itemsLeftToConsider The number of elements from the `numericElementsCollection`
     *                                     that are still available for division.
     * @returns {number} The accumulated count of combinations modulo `PRIME_MODULUS`.
     */
    function calculateRecursiveCombinations(currentWorkingRemainder, itemsLeftToConsider) {
        // Base Case 1: If the current remainder is less than the smallest element in our sorted collection,
        // no further division is possible with the available elements.
        // In this scenario, the result is the current remainder multiplied by the factorial of
        // the remaining items (modulo PRIME_MODULUS). This implies a specific interpretation of the problem.
        if (currentWorkingRemainder < numericElementsCollection[0]) {
            return (currentWorkingRemainder * memoizedFactorials[itemsLeftToConsider]) % PRIME_MODULUS;
        }

        // Base Case 2: If there are no more items left to consider for division,
        // this path yields no further combinations.
        if (itemsLeftToConsider <= 0) {
            return 0;
        }

        // Determine the 'split point': find the index of the first element in `numericElementsCollection`
        // that is greater than or equal to `currentWorkingRemainder`.
        // All elements before this `splitPoint` are smaller than `currentWorkingRemainder`.
        let divisionSplitPoint = 0;
        while (divisionSplitPoint < numericElementsCollection.length && numericElementsCollection[divisionSplitPoint] < currentWorkingRemainder) {
            divisionSplitPoint++;
        }

        // Accumulate results from recursive calls.
        let cumulativeWays = 0;
        for (let iterationIndex = 0; iterationIndex < divisionSplitPoint; iterationIndex++) {
            // Calculate the new remainder for the next recursive step.
            const nextRemainderValue = currentWorkingRemainder % numericElementsCollection[iterationIndex];
            // Recursively call the function with the new remainder and one fewer item to consider.
            // Ensure each addition is performed modulo PRIME_MODULUS to prevent overflow.
            cumulativeWays = (cumulativeWays + calculateRecursiveCombinations(nextRemainderValue, itemsLeftToConsider - 1)) % PRIME_MODULUS;
        }

        return cumulativeWays;
    }

    // Primary Problem Condition Check:
    // If the smallest number in the input dataset is 1, the problem states that the output should be 0.
    // This is an overarching condition for the entire problem, not a sub-problem base case.
    if (numericElementsCollection[0] === 1) {
        console.log(0);
    } else {
        // If the special condition is not met, proceed with the main recursive computation.
        const finalComputedResult = calculateRecursiveCombinations(primaryTarget, datasetSize);
        console.log(finalComputedResult);
    }
}

// Main execution block:
// Read the entire content of standard input as a UTF-8 string.
// Then, pass this raw input string to our main processing function.
orchestrateMainProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));