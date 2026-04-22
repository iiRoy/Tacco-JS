// Acknowledgment: This code originates from an external source,
// adapted for specific processing requirements.
// The initial setup part handles standard input/output.

// Import necessary modules for I/O and debugging.
const inputReaderModule = require('readline');
const debugUtilityModule = require('util');

// Initialize input processing components.
let dataStreamProcessor = inputReaderModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Storage for raw input lines and the parsed input object.
let rawInputLines = [];
let parsedInputHandler; // This will hold our custom input iterator.

// Event listener for each line of input received.
dataStreamProcessor.on('line', (currentLine) => {
    // Basic validation: ensure input is a string and not empty.
    if (typeof currentLine === 'string' && currentLine.trim().length > 0) {
        rawInputLines.push(currentLine);
    } else {
        // Log a warning for empty or invalid lines, but don't halt.
        logDiagnostic('Warning: Skipping empty or invalid input line.');
    }
});

// Event listener for when the input stream closes.
dataStreamProcessor.on('close', () => {
  // Initialize the input handler with all collected lines.
  parsedInputHandler = initializeInputProcessor(rawInputLines);

  // Performance measurement setup.
  const executionStartTime = process.hrtime.bigint(); // Using high-resolution time for precision.

  // Execute the primary application logic.
  mainApplicationLogic();

  // Calculate elapsed time.
  const executionEndTime = process.hrtime.bigint();
  const elapsedMicroseconds = (executionEndTime - executionStartTime) / 1000n; // Convert nanoseconds to microseconds.

  // Report performance metrics.
  logDiagnostic(`Execution time: ${Number(elapsedMicroseconds) / 1000} ms`);
  const memorySnapshot = process.memoryUsage();
  logDiagnostic(`Memory usage (heap total): ${Math.round(memorySnapshot.heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of a given object.
 * This method is suitable for JSON-serializable objects (no functions, Dates, etc.).
 * @param {object} sourceObject - The object to clone.
 * @returns {object} A new object that is a deep copy of the source.
 */
function createDeepCopy(sourceObject) {
    if (sourceObject === null || typeof sourceObject !== 'object') {
        return sourceObject; // Return primitives directly.
    }
    // A simple, albeit sometimes limited, method for deep cloning.
    // Handles JSON-serializable data types.
    return JSON.parse(JSON.stringify(sourceObject));
}

// Helper functions to retrieve and convert input elements.
/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The next integer.
 */
function retrieveNextInteger() { return convertInput(retrieveNextElement(), 1); }

/**
 * Retrieves the next array of strings (space-separated) from the input stream.
 * @returns {string[]} An array of strings.
 */
function retrieveNextStringArray() { return convertInput(retrieveNextElement(), 2); }

/**
 * Retrieves the next array of integers (space-separated) from the input stream.
 * @returns {number[]} An array of integers.
 */
function retrieveNextIntegerArray() { return convertInput(retrieveNextElement(), 4); }

/**
 * Retrieves the next array of characters from the input stream.
 * @returns {string[]} An array of characters.
 */
function retrieveNextCharacterArray() { return convertInput(retrieveNextElement(), 6); }

/**
 * Retrieves the next raw element (line) from the input stream.
 * @returns {string} The next line of input.
 */
function retrieveNextElement() { return parsedInputHandler.getNextItem(); }

/**
 * Checks if there are more elements in the input stream.
 * @returns {boolean} True if more elements are available, false otherwise.
 */
function hasMoreElements() { return parsedInputHandler.hasMoreItems(); }

/**
 * Initializes an object to manage input lines, providing iteration capabilities.
 * @param {string[]} linesCollection - An array of raw input strings.
 * @returns {object} An object with methods to access input sequentially.
 */
function initializeInputProcessor(linesCollection) {
  // Defensive check for input collection.
  if (!Array.isArray(linesCollection)) {
    throw new Error("Input lines collection must be an array.");
  }

  // Define the input handler structure.
  const inputNavigator = {
    storedLines : linesCollection,
    currentLineIndex : 0,
    totalLines : linesCollection.length,

    /**
     * Checks if there are any remaining lines to process.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreItems : function() {
        return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the next line from the collection and advances the pointer.
     * @returns {string} The next line of input.
     * @throws {Error} If attempting to read beyond the end of the input.
     */
    getNextItem : function() {
        if (!this.hasMoreItems()) {
            throw new Error("EndOfInputException: No more input lines available.");
        }
        const nextInputLine = this.storedLines[this.currentLineIndex];
        this.currentLineIndex++;
        return nextInputLine;
    }
  };
  return inputNavigator;
}

/**
 * Prints a message to standard output.
 * @param {*} message - The content to print.
 */
function displayOutput(message) {
    console.log(message);
}

/**
 * Logs a diagnostic message to standard error, formatted for debugging.
 * @param {*} debugPayload - The data or message to log for debugging.
 */
function logDiagnostic(debugPayload) {
    // Using inspect to provide a detailed view of objects, without color or depth limits.
    console.error("DEBUG_INFO: " + debugUtilityModule.inspect(debugPayload, { colors: false, depth: null }));
}

/**
 * Utility function to convert input strings based on a specified conversion type.
 * @param {string|string[]} inputData - The data to convert. Can be a string or an array of strings.
 * @param {number} conversionType - An integer code specifying the conversion rule.
 *   1: Convert string to integer (radix 10).
 *   2: Split string by space into string array.
 *   3: Convert string to float. (Added new type)
 *   4: Split string by space and convert to array of numbers.
 *   5: Split string by comma into string array. (Added new type)
 *   6: Split string into character array.
 *   7: Split string into character array and convert to array of numbers.
 *   8: Join array of strings with space.
 *   9: Join array of strings with newline.
 *   0: Join array of strings without separator.
 * @returns {*} The converted data, or the original data if conversion fails or type is unknown.
 */
function convertInput(inputData, conversionType) {
    try {
        switch (conversionType) {
            case 1: return Number.parseInt(inputData, 10); // Explicit radix for integer conversion.
            case 2: return inputData.split(" ");
            case 3: return Number.parseFloat(inputData); // New type: float conversion.
            case 4: return inputData.split(" ").map(Number);
            case 5: return inputData.split(","); // New type: comma-separated string array.
            case 6: return inputData.split("");
            case 7: return inputData.split("").map(Number);
            case 8: return Array.isArray(inputData) ? inputData.join(" ") : inputData; // Guard for non-array input for join operations.
            case 9: return Array.isArray(inputData) ? inputData.join("\n") : inputData;
            case 0: return Array.isArray(inputData) ? inputData.join("") : inputData;
            default:
                logDiagnostic(`Warning: Unknown conversion type '${conversionType}'. Returning original data.`);
                return inputData;
        }
    } catch (conversionError) {
        logDiagnostic(`Error during input conversion (type ${conversionType}): ${conversionError.message}. Returning original data.`);
        return inputData; // Return original data on error to prevent program crash.
    }
}

// End of utility functions and setup code.
// The main algorithm implementation follows.

/**
 * Implements the core logic of the application to find the minimum cost.
 * This function reads input, processes subsets, and calculates a minimum modification cost.
 */
function mainApplicationLogic() {
    // Retrieve initial configuration parameters.
    const initialParams = retrieveNextIntegerArray();
    const totalElements = initialParams[0]; // N from original code: total number of elements.
    const requiredSelectionSize = initialParams[1]; // K from original code: minimum number of elements required in a selection.

    // Retrieve the main sequence of numbers to be processed.
    const numericSequence = retrieveNextIntegerArray(); // 'list' from original code.

    // Initialize the variable to store the minimum cost found.
    // Use a very large number as an initial upper bound for cost.
    let minimumAdjustmentCost = Number.MAX_SAFE_INTEGER; // 'output' from original code.

    // --- Guard Clauses and Edge Cases for Early Exit ---
    // If required selection size is 1, no adjustment is needed as a single element is always "increasing".
    if (requiredSelectionSize === 1) {
        displayOutput(0);
        return;
    }
    // If the total number of elements available is less than the required selection size,
    // it's impossible to form a valid selection.
    if (totalElements < requiredSelectionSize) {
        logDiagnostic("Error: Total elements less than required selection size. No valid combinations possible.");
        displayOutput(0); // Assuming 0 cost for impossible scenario, or problem might specify -1.
        return;
    }
    // If the input numeric sequence is empty or invalid, no processing can occur.
    if (!numericSequence || numericSequence.length === 0) {
        logDiagnostic("Error: Numeric sequence is empty or invalid.");
        displayOutput(0);
        return;
    }

    // Iterate through all possible subsets of the numeric sequence using a bitmask approach.
    // The loop runs from 0 up to (2^totalElements - 1), where each bit represents an element's inclusion.
    for (let subsetBitmask = 0; subsetBitmask < (1 << totalElements); subsetBitmask++) {
        // Create a temporary array to hold elements selected for the current subset.
        // The first element (at index 0) is always included as per the problem's implicit rule.
        const currentSubsetElements = [numericSequence[0]];

        // Populate the currentSubsetElements array based on the bitmask.
        // Start from the second element (index 1) because the first is already included.
        for (let elementIndex = 1; elementIndex < totalElements; elementIndex++) {
            // Check if the bit corresponding to the current elementIndex is set in the bitmask.
            // If the bit is set, include the element in the current subset.
            if ((subsetBitmask & (1 << elementIndex)) !== 0) {
                currentSubsetElements.push(numericSequence[elementIndex]);
            }
        }

        // Only proceed with cost calculation if the current subset has at least the required number of elements.
        if (currentSubsetElements.length >= requiredSelectionSize) {
            let currentSubsetCost = 0; // 'sum' from original code.
            // Create a deep copy of the current subset to perform modifications without affecting the original selection.
            const workingSubset = createDeepCopy(currentSubsetElements);

            // Iterate through the selected elements (in the working copy) to calculate the adjustment cost.
            // Start from the second element (index 1) to compare it with its immediate predecessor.
            for (let idx = 1; idx < workingSubset.length; idx++) {
                const previousValue = workingSubset[idx - 1];
                const currentValue = workingSubset[idx];

                // If the previous element is greater than or equal to the current element,
                // an adjustment is needed to ensure a strictly increasing order.
                if (previousValue >= currentValue) {
                    // Calculate the minimum amount needed to make 'currentValue' strictly greater than 'previousValue'.
                    const adjustmentAmount = previousValue - currentValue + 1;
                    currentSubsetCost += adjustmentAmount;

                    // Apply the adjustment: update 'currentValue' to be 'previousValue + 1'.
                    workingSubset[idx] = previousValue + 1;
                }
            }
            // Update the overall minimum cost if the current subset's calculated cost is lower.
            minimumAdjustmentCost = Math.min(minimumAdjustmentCost, currentSubsetCost);
        }
    }

    // Display the final calculated minimum adjustment cost.
    displayOutput(minimumAdjustmentCost);
}