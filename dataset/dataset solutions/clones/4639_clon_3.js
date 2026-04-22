// This section establishes the environment for input handling and provides essential utility functions.
// It is designed to be modular and support the main problem-solving routine.

// Constants for error messages and maximum values.
const INPUT_STREAM_EXHAUSTION_ERROR = "Input stream has been fully consumed. No more data available.";
const EXTREME_HIGH_COST = Number.MAX_SAFE_INTEGER; // Represents an impossibly high cost, typically for initial min/max calculations.

// Initializes the readline interface for standard input/output.
const dataAcquirer = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputContextProcessor = null; // This will hold the object responsible for parsing input lines.
const bufferedInputLines = []; // A temporary buffer to store all incoming lines from standard input.

// Event handler for each line received from standard input.
dataAcquirer.on('line', (individualLineContent) => {
  bufferedInputLines.push(individualLineContent);
});

// Event handler for when the standard input stream closes.
dataAcquirer.on('close', () => {
  inputContextProcessor = initializeInputHandler(bufferedInputLines); // Set up the input processing object.
  recordDiagnosticMessage("Input processing context successfully initialized.");

  // Measure the execution time of the main logic.
  const coreLogicStartTime = performance.now(); // Using high-resolution timer for precision.
  executeProblemSolver(); // Invoke the primary function that contains the problem's solution.
  const coreLogicEndTime = performance.now();

  outputPerformanceMetrics(coreLogicStartTime, coreLogicEndTime); // Display performance statistics.
});

/**
 * Creates a deep copy of an object.
 * This function is provided as a general utility, though its direct use in the main algorithm might be limited.
 * @param {object} originalObject - The object to be cloned.
 * @returns {object} A new object that is a deep copy of the original.
 */
function createDeepCopy(originalObject) {
    // Primitive values are returned as is.
    if (typeof originalObject !== 'object' || originalObject === null) {
        return originalObject;
    }
    try {
        // Standard method for deep cloning simple JSON-compatible objects.
        return JSON.parse(JSON.stringify(originalObject));
    } catch (cloningError) {
        recordDiagnosticMessage(`Warning: Deep cloning failed for an object. Error: ${cloningError.message}`);
        // As a fallback, return a shallow copy or the original object.
        return { ...originalObject };
    }
}

// Helper functions to retrieve and convert the next piece of input data.
function fetchNextInteger() { return transformInputData(retrieveNextDatum(), 1); }
function fetchNextStringArray() { return transformInputData(retrieveNextDatum(), 2); }
function fetchNextNumericArray() { return transformInputData(retrieveNextDatum(), 4); }
function fetchNextCharacterArray() { return transformInputData(retrieveNextDatum(), 6); }

/**
 * Retrieves the next available input line and advances the internal pointer.
 * @returns {string} The next line from the input buffer.
 * @throws {Error} If no more input lines are available.
 */
function retrieveNextDatum() {
    if (!inputContextProcessor || !inputContextProcessor.hasMoreData()) {
        throw new Error(INPUT_STREAM_EXHAUSTION_ERROR);
    }
    return inputContextProcessor.advanceAndExtract();
}

/**
 * Checks if there are more input lines available to be processed.
 * @returns {boolean} True if more data exists, false otherwise.
 */
function hasPendingInput() {
    return inputContextProcessor ? inputContextProcessor.hasMoreData() : false;
}

/**
 * Sets up the input processing mechanism.
 * @param {string[]} rawInputLines - An array of raw strings collected from standard input.
 * @returns {object} An object providing methods to access input data sequentially.
 */
function initializeInputHandler(rawInputLines) {
  // Guard clause for empty or invalid input.
  if (!Array.isArray(rawInputLines) || rawInputLines.length === 0) {
      recordDiagnosticMessage("Warning: Input handler initialized with an empty set of lines.");
      return {
          sourceRecords: [],
          readPointer: 0,
          totalRecords: 0,
          hasMoreData: () => false,
          advanceAndExtract: () => { throw new Error(INPUT_STREAM_EXHAUSTION_ERROR); }
      };
  }

  const dataManagementObject = {
    sourceRecords: rawInputLines,
    readPointer: 0,
    totalRecords: rawInputLines.length,

    // Determines if there are still lines to read.
    hasMoreData: function() {
        return this.readPointer < this.totalRecords;
    },

    // Returns the current line and moves to the next.
    advanceAndExtract: function() {
        if (!this.hasMoreData()) {
            throw new Error(INPUT_STREAM_EXHAUSTION_ERROR);
        }
        const currentExtractedLine = this.sourceRecords[this.readPointer];
        this.readPointer++; // Post-increment the pointer.
        return currentExtractedLine;
    }
  };
  return dataManagementObject;
}

/**
 * Prints a result to the standard output.
 * @param {any} contentToDisplay - The data to be logged to console.
 */
function displayFinalResult(contentToDisplay) { console.log(contentToDisplay); }

/**
 * Logs detailed debug or error messages to standard error.
 * Uses `util.inspect` for better representation of complex objects.
 * @param {any} diagnosticMessage - The message or data to log.
 */
function recordDiagnosticMessage(diagnosticMessage) {
    console.error(`DIAGNOSTIC: ${require("util").inspect(diagnosticMessage, false, null)}`);
}

/**
 * Reports the execution time and memory usage to standard error.
 * @param {number} startTime - High-resolution timestamp for the start of execution.
 * @param {number} endTime - High-resolution timestamp for the end of execution.
 */
function outputPerformanceMetrics(startTime, endTime) {
    const durationMilliseconds = (endTime - startTime).toFixed(3);
    recordDiagnosticMessage(`Duration: ${durationMilliseconds} ms`);
    const heapMemoryUsageKB = (process.memoryUsage().heapTotal / 1024).toFixed(3);
    recordDiagnosticMessage(`Memory (Heap Total): ${heapMemoryUsageKB} KB`);
}

/**
 * Generic function for converting input values based on a specified type.
 * Handles various parsing and joining operations.
 * @param {any} inputValue - The raw input value to be converted.
 * @param {number} conversionTypeIndicator - An integer specifying the target conversion.
 *   1: To Integer.
 *   2: To String Array (split by space).
 *   3: To Float (new conversion type).
 *   4: To Number Array (split by space).
 *   6: To Character Array.
 *   7: To Number Array (split by character).
 *   8: Join Array by Space.
 *   9: Join Array by Newline.
 *   0: Join Array without Separator.
 * @returns {any} The converted value, or the original value if conversion fails or type is unknown.
 */
function transformInputData(inputValue, conversionTypeIndicator) {
    try {
        const inputAsString = String(inputValue); // Ensure input is treated as a string for splits.
        switch (conversionTypeIndicator) {
            case 1:
                const numVal = Number(inputAsString);
                return Number.isInteger(numVal) ? numVal : parseInt(inputAsString, 10); // Robust integer parsing.
            case 2: return inputAsString.split(" ");
            case 3: return parseFloat(inputAsString); // New: Convert to floating-point number.
            case 4: return inputAsString.split(" ").map(Number);
            case 6: return inputAsString.split("");
            case 7: return inputAsString.split("").map(Number);
            case 8: return Array.isArray(inputValue) ? inputValue.join(" ") : inputAsString;
            case 9: return Array.isArray(inputValue) ? inputValue.join("\n") : inputAsString;
            case 0: return Array.isArray(inputValue) ? inputValue.join("") : inputAsString;
            default:
                recordDiagnosticMessage(`Warning: Unrecognized conversion type '${conversionTypeIndicator}'. Returning original input.`);
                return inputValue;
        }
    } catch (conversionErrorDetails) {
        recordDiagnosticMessage(`Error occurred during data transformation (type ${conversionTypeIndicator}): ${conversionErrorDetails.message}`);
        return inputValue; // Return original value on error.
    }
}

// Utility function to check if a specific bit is set within an integer.
const isBitPositionSet = (numericalValue, bitIndex) => (numericalValue & (1 << bitIndex)) !== 0;

// Calculates the cost to make 'nextValue' strictly greater than 'currentValue'.
const determineAdjustmentCost = (currentValue, nextValue) => {
    if (currentValue >= nextValue) {
        return currentValue - nextValue + 1;
    }
    return 0; // No cost if already in desired order.
};

/**
 * Main function containing the problem-solving algorithm.
 * This function reads input, processes it, and outputs the final result.
 */
function executeProblemSolver() {
    // Initial validation: ensure there's input to process.
    if (!hasPendingInput()) {
        recordDiagnosticMessage("Error: No input data found to execute the core logic.");
        displayFinalResult(0); // Default or error result.
        return;
    }

    const initialParameters = fetchNextNumericArray();
    // Validate the number of initial parameters.
    if (initialParameters.length < 2) {
        recordDiagnosticMessage("Error: Expected at least two initial parameters (N, K).");
        displayFinalResult(0);
        return;
    }

    const numberOfElements = initialParameters[0]; // Corresponds to original N.
    const requiredSubsetCount = initialParameters[1]; // Corresponds to original K.

    const numericalInputSequence = fetchNextNumericArray(); // Corresponds to original 'list'.

    // Further input validation.
    if (numberOfElements <= 0 || requiredSubsetCount <= 0 || numericalInputSequence.length !== numberOfElements) {
        recordDiagnosticMessage(`Error: Invalid problem constraints or input array length. N=${numberOfElements}, K=${requiredSubsetCount}, Array Length=${numericalInputSequence.length}`);
        displayFinalResult(0);
        return;
    }

    // Edge case: If only one or fewer elements are required, no adjustments are needed.
    if (requiredSubsetCount <= 1) {
        displayFinalResult(0);
        return;
    }

    let minimumAdjustmentRequired = EXTREME_HIGH_COST; // Initialize with the highest possible cost.

    // Calculate the total number of subsets (2^N) once for efficiency.
    const totalPossibleSubsets = 1 << numberOfElements;

    // Iterate through all possible subsets using a bitmask from 0 to 2^N - 1.
    for (let subsetMask = 0; subsetMask < totalPossibleSubsets; subsetMask++) {
        // Each subset must always include the very first element from the original sequence.
        const currentSelectedSubset = [numericalInputSequence[0]];

        // Build the subset based on the bits set in the current mask.
        for (let elementPosition = 1; elementPosition < numberOfElements; elementPosition++) {
            // If the bit at 'elementPosition' is set, include the corresponding element.
            if (isBitPositionSet(subsetMask, elementPosition)) {
                currentSelectedSubset.push(numericalInputSequence[elementPosition]);
            }
        }

        // Proceed only if the constructed subset meets the minimum required count.
        if (currentSelectedSubset.length >= requiredSubsetCount) {
            let currentSubsetCost = 0;
            // Create a mutable copy of the subset for performing adjustments within this iteration.
            const mutableSubsetForAdjustments = createDeepCopy(currentSelectedSubset);

            // Iterate through the mutable subset to ensure elements are strictly increasing.
            for (let comparisonIndex = 0; comparisonIndex < mutableSubsetForAdjustments.length - 1; comparisonIndex++) {
                const valueAtCurrentIndex = mutableSubsetForAdjustments[comparisonIndex];
                const valueAtNextIndex = mutableSubsetForAdjustments[comparisonIndex + 1];

                const costForAdjustment = determineAdjustmentCost(valueAtCurrentIndex, valueAtNextIndex);

                if (costForAdjustment > 0) {
                    currentSubsetCost += costForAdjustment;
                    // Apply the calculated adjustment to the next element in the mutable subset.
                    mutableSubsetForAdjustments[comparisonIndex + 1] += costForAdjustment;
                }
            }
            // Update the overall minimum adjustment cost found across all valid subsets.
            minimumAdjustmentRequired = Math.min(minimumAdjustmentRequired, currentSubsetCost);
        }
    }
    // Display the final calculated minimum cost.
    displayFinalResult(minimumAdjustmentRequired);
}