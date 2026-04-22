// --- Core application startup and input management ---

// Establishes an interface for reading input line by line from the console.
const standardInputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let accumulatedInputLines = []; // Stores all lines read from standard input.
let inputTokenManager; // An object responsible for providing input tokens sequentially.

// Event handler: When a new line of input is received.
standardInputReader.on('line', (individualLine) => {
    accumulatedInputLines.push(individualLine);
});

// Event handler: When the input stream has ended.
standardInputReader.on('close', () => {
    // Initialize the token manager with all captured input lines.
    inputTokenManager = createInputTokenService(accumulatedInputLines);

    // Record the start time for performance measurement using high-resolution timer.
    const executionStartTimestamp = process.hrtime.bigint();

    // Invoke the primary logic function.
    executeApplicationLogic();

    // Calculate the elapsed time.
    const executionEndTimestamp = process.hrtime.bigint();
    const durationInMilliseconds = Number(executionEndTimestamp - executionStartTimestamp) / 1_000_000; // Convert nanoseconds to milliseconds.

    // Log performance metrics.
    recordDiagnosticMessage(`Execution Duration: ${durationInMilliseconds.toFixed(3)} ms`);
    recordDiagnosticMessage(`Memory Footprint (Heap Total): ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

// --- Utility Functions for Input Processing ---

/**
 * Creates an object to manage sequential access to input lines.
 * @param {string[]} lineData An array of strings representing input lines.
 * @returns {object} An object with methods to check for next tokens and retrieve them.
 */
function createInputTokenService(lineData) {
    // Validate input: Ensure it's an array and not empty.
    if (!Array.isArray(lineData) || lineData.length === 0) {
        recordDiagnosticMessage("Warning: Input data array for token service is empty or invalid. The service will report no available tokens.");
        return {
            sourceSegments: [],
            currentPointer: 0,
            totalSegments: 0,
            hasMoreTokens: () => false,
            getNextToken: () => { throw new Error("InputExhaustedError: No more tokens to retrieve."); }
        };
    }

    const serviceInstance = {
        sourceSegments: lineData,
        currentPointer: 0,
        totalSegments: lineData.length,

        /** Checks if there are more input tokens available. */
        hasMoreTokens: function() {
            return this.currentPointer < this.totalSegments;
        },

        /** Retrieves the next input token (line). */
        getNextToken: function() {
            if (!this.hasMoreTokens()) {
                throw new Error("InputExhaustedError: Attempted to read beyond the end of input.");
            }
            const nextSegment = this.sourceSegments[this.currentPointer];
            this.currentPointer++; // Advance the pointer after fetching.
            return nextSegment;
        }
    };
    return serviceInstance;
}

/**
 * Performs a deep copy of a JSON-serializable object.
 * @param {object} sourceObject The object to copy.
 * @returns {object} A new, independent copy of the object.
 */
function createDeepClone(sourceObject) {
    if (sourceObject === null || typeof sourceObject !== 'object') {
        return sourceObject; // Primitives are returned as-is.
    }
    // Prefer structuredClone for modern Node.js environments (more robust than JSON parse/stringify).
    if (typeof structuredClone === 'function') {
        return structuredClone(sourceObject);
    } else {
        // Fallback for older environments, limited to JSON-serializable types.
        return JSON.parse(JSON.stringify(sourceObject));
    }
}

/**
 * Transforms an input value based on a specified operation code.
 * @param {*} valueToConvert The input value.
 * @param {number} operationCode The code indicating the conversion type.
 * @returns {*} The converted value or the original value if conversion fails/is unknown.
 */
function applyDataTransformation(valueToConvert, operationCode) {
    /*
     * Transformation Operation Codes:
     *  1: Convert to an integer number.
     *  2: Split string by whitespace into an array of strings.
     *  4: Split string by whitespace, then convert each resulting part to a number.
     *  6: Split string into an array of individual characters.
     *  7: Split string into individual characters, then convert each to a number.
     *  8: Join array elements with a single space.
     *  9: Join array elements with a newline character.
     *  0: Join array elements without any separator.
     * Default: Return input as-is for unrecognized codes or errors.
     */
    try {
        const stringRepresentation = String(valueToConvert); // Ensure string context for splitting operations.

        switch (operationCode) {
            case 1:
                return Number(valueToConvert); // Direct conversion to number.
            case 2:
                // Splits by one or more whitespace characters, filtering out empty strings.
                return stringRepresentation.split(/\s+/).filter(segment => segment !== '');
            case 4:
                return stringRepresentation.split(/\s+/).filter(segment => segment !== '').map(Number);
            case 6:
                // Creates an array from string characters.
                return Array.from(stringRepresentation);
            case 7:
                return Array.from(stringRepresentation, Number); // Converts each character to a number.
            case 8:
                // Only join if the input is an array.
                if (Array.isArray(valueToConvert)) return valueToConvert.join(" ");
                else return stringRepresentation;
            case 9:
                if (Array.isArray(valueToConvert)) return valueToConvert.join("\n");
                else return stringRepresentation;
            case 0:
                if (Array.isArray(valueToConvert)) return valueToConvert.join("");
                else return stringRepresentation;
            default:
                recordDiagnosticMessage(`Notice: Unknown transformation code '${operationCode}'. Value returned unchanged.`);
                return valueToConvert;
        }
    } catch (error) {
        recordDiagnosticMessage(`Error during data transformation for value: '${valueToConvert}' with code: ${operationCode}. Details: ${error.message}`);
        return valueToConvert; // Return original value upon any error.
    }
}

// Shorthand functions for common input retrieval patterns.
function retrieveInteger() { return applyDataTransformation(inputTokenManager.getNextToken(), 1); }
function retrieveStringArray() { return applyDataTransformation(inputTokenManager.getNextToken(), 2); }
function retrieveIntegerArray() { return applyDataTransformation(inputTokenManager.getNextToken(), 4); }
function retrieveCharArray() { return applyDataTransformation(inputTokenManager.getNextToken(), 6); } // Not used in core logic.

// Direct access to the token manager's methods.
function getNextInputToken() { return inputTokenManager.getNextToken(); }
function hasRemainingTokens() { return inputTokenManager.hasMoreTokens(); }

// Output functions.
function presentResult(outputContent) { console.log(outputContent); }
function recordDiagnosticMessage(messagePayload) {
    // Uses Node.js 'util.inspect' for comprehensive debugging output.
    console.error(`[DEBUG_LOG]: ${require("util").inspect(messagePayload, false, null)}`);
}

// --- End of boilerplate input/output handling and utilities ---

/**
 * Implements the main problem-solving logic.
 * This function reads parameters, processes a sequence, and computes a minimum cost.
 */
function executeApplicationLogic() {
    // Read the first line containing two integer parameters.
    const problemParameters = retrieveIntegerArray();
    const totalElements = problemParameters[0]; // Renamed N -> totalElements
    const requiredSelectionCount = problemParameters[1]; // Renamed K -> requiredSelectionCount

    // Read the sequence of numbers for processing.
    const originalNumericSequence = retrieveIntegerArray(); // Renamed list -> originalNumericSequence

    // Initialize minimum cost to a very large number.
    const LARGE_COST_SENTINEL = 1e16; // Renamed output -> minimumCost, added constant
    let minimumCost = LARGE_COST_SENTINEL;

    // Early exit: If only one element is required, the cost is always zero.
    if (requiredSelectionCount === 1) {
        presentResult(0);
        return;
    }

    // Iterate through all possible subsets using a bitmask approach.
    // Each bit in 'subsetMask' corresponds to an element's inclusion (excluding the first element).
    for (let subsetMask = 0; subsetMask < (1 << totalElements); ++subsetMask) { // Renamed i -> subsetMask
        // The first element is always included in the subset.
        let currentChosenSubset = [originalNumericSequence[0]]; // Renamed selected -> currentChosenSubset

        // Populate the subset based on the current bitmask.
        for (let elementIndex = 1; elementIndex < totalElements; ++elementIndex) { // Renamed j -> elementIndex
            // Check if the bit corresponding to the current elementIndex is set in the subsetMask.
            if ((subsetMask >>> elementIndex) & 1) { // Equivalent to (subsetMask & (1 << elementIndex)) !== 0
                currentChosenSubset.push(originalNumericSequence[elementIndex]);
            }
        }

        // Optimization: Skip subsets that don't have the required number of elements.
        if (currentChosenSubset.length !== requiredSelectionCount) {
            continue;
        }

        // Create a mutable copy of the chosen subset for cost calculation and modification.
        // This ensures the original `currentChosenSubset` is not altered for subsequent iterations.
        let workingSubset = createDeepClone(currentChosenSubset); // Renamed selected -> workingSubset

        let accumulatedOperationCost = 0; // Renamed sum -> accumulatedOperationCost

        // Calculate the cost to make elements strictly increasing.
        for (let pairStartIdx = 0; pairStartIdx < workingSubset.length - 1; ++pairStartIdx) { // Renamed j -> pairStartIdx
            const currentElementValue = workingSubset[pairStartIdx]; // Helper variable
            const nextElementValue = workingSubset[pairStartIdx + 1]; // Helper variable

            if (currentElementValue >= nextElementValue) {
                // Calculate the minimum increment needed for the next element.
                const requiredIncrement = (currentElementValue - nextElementValue) + 1; // Explicit calculation
                accumulatedOperationCost += requiredIncrement;
                workingSubset[pairStartIdx + 1] += requiredIncrement; // Modify the element in the working subset.
            }
        }
        // Update the overall minimum cost found so far.
        minimumCost = Math.min(minimumCost, accumulatedOperationCost);
    }

    // Output the final calculated minimum cost.
    presentResult(minimumCost);
}