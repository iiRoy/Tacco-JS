const InputParserFactory = (function () {
    // A utility function to safely convert string values to numbers.
    // Returns 0 if conversion results in NaN, mirroring common competitive programming behavior.
    function safeParseNumber(stringValue) {
        const numericValue = Number(stringValue);
        return isNaN(numericValue) ? 0 : numericValue;
    }

    /**
     * Creates an instance of the InputLineStream for processing input text.
     * @param {string} sourceContent - The raw string content to be parsed.
     * @returns {InputLineStream} A parser instance.
     */
    function createInputProcessor(sourceContent) {
        // Guard clause for invalid or empty input content.
        if (typeof sourceContent !== 'string' || sourceContent.trim() === '') {
            console.warn("Warning: Input source content is empty or invalid. Initializing with empty data.");
            return new InputLineStream("");
        }
        return new InputLineStream(sourceContent);
    }

    /**
     * @class InputLineStream
     * @description Handles parsing of input text line by line, token by token.
     */
    function InputLineStream(rawData) {
        // Store all input lines, trimmed to remove leading/trailing whitespace.
        this.sourceLines = rawData.trim().split("\n");
        // Tracks the current line index being processed from sourceLines.
        this.currentLinePosition = 0;
        // Buffer for tokens extracted from the current line, stored in reverse order
        // to facilitate efficient 'pop' operations from the end.
        this.currentLineTokensReversed = [];
    }

    /**
     * Extracts the next single token (word) from the input stream.
     * Tokens are read from right-to-left within a line.
     * Advances to the next line only when the current line's tokens are exhausted.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The next token, or an empty string/0 if no more input.
     */
    InputLineStream.prototype.extractNextValue = function (returnAsString = false) {
        // If the token buffer for the current line is empty, load the next line.
        if (this.currentLineTokensReversed.length === 0) {
            // Check if we have processed all available lines.
            if (this.currentLinePosition >= this.sourceLines.length) {
                // No more input, return default values.
                return returnAsString ? "" : 0;
            }

            let activeLineContent = this.sourceLines[this.currentLinePosition];
            // Skip empty or whitespace-only lines to prevent errors.
            if (typeof activeLineContent !== 'string' || activeLineContent.trim() === '') {
                this.currentLinePosition++; // Move to the subsequent line.
                // Recursively call to find the next valid token from the next line.
                return this.extractNextValue(returnAsString);
            }

            // Split the line by spaces and reverse to prepare for `pop()`.
            this.currentLineTokensReversed = activeLineContent.split(" ").reverse();
            // Note: currentLinePosition is NOT incremented here. It's incremented when the line is fully consumed.
        }

        const retrievedToken = this.currentLineTokensReversed.pop();

        // If the token buffer is now empty after popping, it means the current line is fully consumed.
        // So, advance to the next line for future reads.
        if (this.currentLineTokensReversed.length === 0) {
            this.currentLinePosition++;
        }

        // Handle cases where the retrieved token might be undefined (e.g., due to multiple spaces) or empty.
        if (retrievedToken === undefined || retrievedToken === '') {
            return returnAsString ? "" : 0;
        }

        return returnAsString ? retrievedToken : safeParseNumber(retrievedToken);
    };

    /**
     * Reads and processes all tokens from the current line, then advances to the next line.
     * Any pending tokens in the currentLineTokensReversed buffer are discarded.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputLineStream.prototype.readFullLineTokens = function (returnAsString = false) {
        if (this.currentLinePosition >= this.sourceLines.length) {
            return []; // No more lines to read.
        }
        // Discard any partially processed tokens from the current line, as we are reading the whole line.
        this.currentLineTokensReversed = [];
        const lineContent = this.sourceLines[this.currentLinePosition++]; // Read line and advance position.
        const tokens = lineContent.split(" ");
        return returnAsString ? tokens : tokens.map(safeParseNumber);
    };

    /**
     * Reads a specified number of lines, treating each as a row in a matrix,
     * and splits each line into tokens. Advances the line position.
     * @param {number} rowCount - The number of rows (lines) to read.
     * @param {boolean} [returnAsString=false] - If true, returns matrix elements as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
     */
    InputLineStream.prototype.readMultiLineMatrix = function (rowCount, returnAsString = false) {
        if (rowCount <= 0) return []; // Invalid row count.

        // Determine the actual number of lines available to read.
        let linesToProcess = Math.min(rowCount, this.sourceLines.length - this.currentLinePosition);
        if (linesToProcess <= 0) return []; // No lines available.

        // Discard any partially processed tokens from the current line.
        this.currentLineTokensReversed = [];

        // Extract the relevant lines and advance the position.
        const matrixRawRows = this.sourceLines.slice(this.currentLinePosition, this.currentLinePosition + linesToProcess);
        this.currentLinePosition += linesToProcess;

        // Process each raw row into an array of tokens.
        const processedMatrix = matrixRawRows.map(row => row.split(" "));
        return returnAsString ? processedMatrix : processedMatrix.map(row => row.map(safeParseNumber));
    };

    /**
     * Reads a specified number of raw lines without splitting them into tokens.
     * Advances the line position.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns lines as strings; otherwise, attempts to convert to number.
     * @returns {Array<string|number>} An array of raw lines.
     */
    InputLineStream.prototype.readSequentialLines = function (lineCount, returnAsString = false) {
        if (lineCount <= 0) return []; // Invalid line count.

        // Determine the actual number of lines available to read.
        let linesToProcess = Math.min(lineCount, this.sourceLines.length - this.currentLinePosition);
        if (linesToProcess <= 0) return []; // No lines available.

        // Discard any partially processed tokens from the current line.
        this.currentLineTokensReversed = [];

        // Extract the relevant lines and advance the position.
        const rawLines = this.sourceLines.slice(this.currentLinePosition, this.currentLinePosition + linesToProcess);
        this.currentLinePosition += linesToProcess;
        return returnAsString ? rawLines : rawLines.map(safeParseNumber);
    };

    return createInputProcessor;
})();

// Replacement for xArray - creates multi-dimensional arrays without using eval.
// Uses a recursive approach for safer and more readable array initialization.
function createMultiDimArrayWithDefault(defaultValue, ...dimensions) {
    // Base case: if no more dimensions, return the default value.
    if (dimensions.length === 0) {
        return defaultValue;
    }

    const currentDimensionSize = dimensions[0];
    // Basic validation for dimension size.
    if (typeof currentDimensionSize !== 'number' || currentDimensionSize <= 0) {
        // Return an empty array for invalid or non-positive dimension sizes.
        return [];
    }

    const remainingDimensions = dimensions.slice(1);
    const newArrayInstance = new Array(currentDimensionSize);

    // Recursively fill the array for each element in the current dimension.
    for (let i = 0; i < currentDimensionSize; i++) {
        newArrayInstance[i] = createMultiDimArrayWithDefault(defaultValue, ...remainingDimensions);
    }
    return newArrayInstance;
}

// Setup for reading standard input using the custom parser.
const fileSystemModule = require("fs");

/**
 * Helper function to read content from standard input.
 * Provides a robust way to get input for the parser.
 * @returns {string} The content read from /dev/stdin, or an empty string on error.
 */
function acquireStandardInputContent() {
    try {
        return fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Log the error but continue execution with an empty string to avoid crashing.
        console.error("Failed to read from /dev/stdin:", error.message);
        return "";
    }
}

// Initialize the input processor with content from standard input.
const inputProcessor = InputParserFactory(acquireStandardInputContent());

// Main function to execute the problem's logic.
console.log(determineOptimalConfiguration());

/**
 * Implements the core logic to determine an optimal value based on input data.
 * This function performs calculations, sorting, and a binary search.
 * @returns {number} The calculated optimal value.
 */
function determineOptimalConfiguration() {
    // Read initial problem parameters.
    const numberOfItems = inputProcessor.extractNextValue();
    const unitThreshold = inputProcessor.extractNextValue();

    // Read the matrix of item details. Each row represents an item.
    // Structure: [baseQuantity, basePrice, additionalPrice]
    const itemDetailsList = inputProcessor.readMultiLineMatrix(numberOfItems);

    let totalInitialBaseCost = 0; // Accumulates the sum of (baseQuantity * basePrice) for all items.

    // First pass: Process each item to calculate its base cost and a derived "threshold remainder cost".
    // The derived cost is then appended to the item's data array.
    for (let currentItemIndex = 0; currentItemIndex < numberOfItems; currentItemIndex++) {
        const currentItem = itemDetailsList[currentItemIndex];
        const itemBaseQuantity = currentItem[0];
        const itemBasePrice = currentItem[1];
        const itemAdditionalPrice = currentItem[2];

        // Calculate the base cost for the current item.
        const currentItemBaseCost = itemBaseQuantity * itemBasePrice;
        totalInitialBaseCost += currentItemBaseCost;

        // Calculate the cost component for units beyond baseQuantity, up to unitThreshold.
        // This is stored as the fourth element (index 3) of the item's array.
        const costForThresholdRemainder = (unitThreshold - itemBaseQuantity) * itemAdditionalPrice;
        currentItem.push(costForThresholdRemainder);
    }

    // Sort the items in descending order based on their calculated "threshold remainder cost" (index 3).
    // This sorting strategy is crucial for the subsequent greedy-like processing in the binary search.
    itemDetailsList.sort((itemA, itemB) => itemB[3] - itemA[3]);

    // Binary search initialization.
    // 'searchUpperBound' represents a "good" (feasible) value, 'searchLowerBound' represents a "bad" (infeasible) value.
    // The search aims to find the smallest 'searchUpperBound' for which the condition holds.
    let searchUpperBound = numberOfItems * unitThreshold; // An upper bound for the possible answer.
    let searchLowerBound = -1; // A lower bound for the possible answer.

    // Binary search loop: Continues as long as there's a gap greater than 1 between bounds.
    while (searchUpperBound - searchLowerBound > 1) {
        const midPointCapacity = Math.floor((searchUpperBound + searchLowerBound) / 2);

        let currentReducedCost = totalInitialBaseCost; // Tracks the accumulated cost/value during evaluation.
        let remainingCapacityBudget = midPointCapacity; // Represents the capacity or budget to distribute.

        // Iterate through the sorted items to evaluate the current 'midPointCapacity'.
        // The loop condition ensures we only process items while we have capacity and cost to reduce.
        for (let itemProcessingIndex = 0;
             itemProcessingIndex < numberOfItems && remainingCapacityBudget > 0 && currentReducedCost > 0;
             itemProcessingIndex++) {

            const currentItem = itemDetailsList[itemProcessingIndex];
            const currentItemBaseQuantity = currentItem[0];
            const currentItemBasePrice = currentItem[1];
            const currentItemAdditionalPrice = currentItem[2];
            const currentItemThresholdRemainderCost = currentItem[3];

            // Scenario 1: If the remaining capacity allows taking a full 'unitThreshold' quantity from this item.
            if (unitThreshold <= remainingCapacityBudget) {
                // Subtract the total cost associated with taking 'unitThreshold' units from this item.
                currentReducedCost -= (currentItemBaseQuantity * currentItemBasePrice + currentItemThresholdRemainderCost);
                // Consume the 'unitThreshold' from the budget.
                remainingCapacityBudget -= unitThreshold;
            } else {
                // Scenario 2: Remaining capacity is less than 'unitThreshold'.
                // This block replicates the original code's specific and potentially complex logic.
                // 'tempCalculatedValue' acts as the 'v' variable from the original code,
                // initialized once with 'currentReducedCost' (original 'u').
                let tempCalculatedValue = currentReducedCost;

                // This inner loop continues processing items from the current 'itemProcessingIndex'.
                // The 'itemProcessingIndex' is incremented within this loop.
                // Crucially, 'remainingCapacityBudget' (original 'k') is NOT consumed or modified here.
                for (; itemProcessingIndex < numberOfItems && tempCalculatedValue > 0; itemProcessingIndex++) {
                    const innerLoopItem = itemDetailsList[itemProcessingIndex];
                    const innerItemBaseQuantity = innerLoopItem[0];
                    const innerItemBasePrice = innerLoopItem[1];
                    const innerItemAdditionalPrice = innerLoopItem[2];

                    if (remainingCapacityBudget < innerItemBaseQuantity) {
                        // If the budget is less than the item's base quantity,
                        // subtract the cost of using 'remainingCapacityBudget' units at the base price.
                        tempCalculatedValue -= innerItemBasePrice * remainingCapacityBudget;
                    } else {
                        // If the budget covers the item's base quantity and possibly more,
                        // subtract the cost of base quantity at base price, plus any remaining budget
                        // (after covering base quantity) at the additional price.
                        tempCalculatedValue -= (innerItemBaseQuantity * innerItemBasePrice +
                                                (remainingCapacityBudget - innerItemBaseQuantity) * innerItemAdditionalPrice);
                    }
                }
                // The 'itemProcessingIndex' was incremented one too many times by the inner loop.
                // Decrement it to ensure the outer loop's 'itemProcessingIndex++' correctly advances to the *next* item
                // that hasn't been fully processed by this inner block.
                itemProcessingIndex--;
                // Update 'currentReducedCost' with the final value from the inner loop's calculation.
                currentReducedCost = tempCalculatedValue;
            }
        }

        // After evaluating all items for the current 'midPointCapacity':
        if (currentReducedCost > 0) {
            // If the cost is still positive, it means 'midPointCapacity' was too low (infeasible).
            searchLowerBound = midPointCapacity;
        } else {
            // If the cost is zero or negative, 'midPointCapacity' is feasible or potentially too high.
            searchUpperBound = midPointCapacity;
        }
    }

    // The 'searchUpperBound' will hold the smallest feasible value.
    return searchUpperBound;
}