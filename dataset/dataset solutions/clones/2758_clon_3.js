// This section handles core application setup and input/output plumbing.
// It's generally not part of the problem-solving logic itself.

const AppEssentials = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let applicationInputProcessor;
let capturedInputLines = [];

// Define constants for conversion types to improve readability and maintainability.
const InputConversionType = Object.freeze({
    PARSE_INT: 1,
    SPLIT_STRINGS: 2,
    SPLIT_AND_PARSE_INTS: 4,
    SPLIT_CHARS: 6,
    SPLIT_AND_PARSE_CHARS: 7,
    JOIN_SPACES: 8,
    JOIN_NEWLINES: 9,
    JOIN_NONE: 0,
    AS_IS: -1 // New type for returning the value without modification
});

// Event listener for each line of input received from the standard input.
AppEssentials.on('line', (currentInputLine) => {
    capturedInputLines.push(currentInputLine);
});

// Event listener for when the input stream closes, triggering the main application logic.
AppEssentials.on('close', () => {
    applicationInputProcessor = setupInputContext(capturedInputLines);
    
    // Log a separator for clarity in debug output.
    logToErrorStream("\n--- Application Start ---");

    const startTime = new Date();
    
    try {
        // Execute the primary application logic.
        executeMainLogic();
    } catch (error) {
        // Catch any unhandled errors during execution and log them.
        logToErrorStream(`\n${new Date().toISOString()} [ERROR] Unhandled exception during execution:`);
        logToErrorStream(error);
    } finally {
        const endTime = new Date();
        const durationMs = endTime.getTime() - startTime.getTime();

        // Record and display performance metrics.
        recordPerformanceMetrics(durationMs);
    }
});

// --- Input Processing Utility Functions ---

// Functions to retrieve and convert the next available input token.
function retrieveNextInteger() { return processInputData(obtainNextToken(), InputConversionType.PARSE_INT); }
function retrieveNextStringArray() { return processInputData(obtainNextToken(), InputConversionType.SPLIT_STRINGS); }
function retrieveNextIntArray() { return processInputData(obtainNextToken(), InputConversionType.SPLIT_AND_PARSE_INTS); }
function retrieveNextCharArray() { return processInputData(obtainNextToken(), InputConversionType.SPLIT_CHARS); }

// Core functions for navigating the input stream.
function obtainNextToken() { return applicationInputProcessor.getNextInputLine(); }
function checkMoreTokensAvailable() { return applicationInputProcessor.hasRemainingInput(); }

/**
 * Initializes an input processing context object from an array of lines.
 * This object provides methods to sequentially access input lines.
 * @param {string[]} sourceLines The array of raw input lines to process.
 * @returns {object} An object with methods for input navigation.
 */
function setupInputContext(sourceLines) {
  const inputContext = {
    dataLines : sourceLines,
    currentIndex : 0,
    totalLinesAvailable : sourceLines.length,

    /**
     * Checks if there are more lines available in the input stream.
     * @returns {boolean} True if more input is available, false otherwise.
     */
    hasRemainingInput : function() {
        return (this.currentIndex < this.totalLinesAvailable);
    },

    /**
     * Retrieves the next line from the input stream and advances the pointer.
     * @returns {string} The next line of input.
     * @throws {RangeError} If no more input lines are available.
     */
    getNextInputLine : function() {
        if (!this.hasRemainingInput()) {
            throw new RangeError("End of input reached: No more lines available for processing.");
        }
        const currentLineData = this.dataLines[this.currentIndex];
        this.currentIndex++;
        return currentLineData;
    }
  };
  return inputContext;
}

/**
 * Outputs a given message to the standard console output.
 * @param {*} message The content to be displayed.
 */
function outputResult(message) {
    console.log(message);
}

/**
 * Logs a debug message or error content to the standard error stream, including a timestamp.
 * Utilizes `util.inspect` for detailed object inspection.
 * @param {*} debugContent The content (string, object, etc.) to log for debugging.
 */
function logToErrorStream(debugContent) {
    const util = require("util");
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] DEBUG: ${util.inspect(debugContent, { depth: null, colors: true, showHidden: false })}`);
}

/**
 * Converts an input value based on a specified conversion type.
 * Includes robust error handling and type-checking for common operations.
 * @param {any} inputValue The value to be converted.
 * @param {number} conversionType A constant from `InputConversionType` indicating the desired conversion.
 * @returns {any} The converted value, or the original value if conversion fails or type is unknown.
 */
function processInputData(inputValue, conversionType) {
    if (inputValue === null || inputValue === undefined) {
        logToErrorStream(`Warning: Attempted to process null/undefined input for type ${conversionType}. Returning as-is.`);
        return inputValue;
    }

    try {
        // An object mapping conversion type constants to their respective handler functions.
        const conversionActions = {
            [InputConversionType.PARSE_INT]: (val) => parseInt(String(val), 10), // Explicitly convert to string and use radix 10
            [InputConversionType.SPLIT_STRINGS]: (val) => String(val).split(" "),
            [InputConversionType.SPLIT_AND_PARSE_INTS]: (val) => String(val).split(" ").map(Number),
            [InputConversionType.SPLIT_CHARS]: (val) => String(val).split(""),
            [InputConversionType.SPLIT_AND_PARSE_CHARS]: (val) => String(val).split("").map(Number),
            [InputConversionType.JOIN_SPACES]: (arr) => Array.isArray(arr) ? arr.join(" ") : String(arr),
            [InputConversionType.JOIN_NEWLINES]: (arr) => Array.isArray(arr) ? arr.join("\n") : String(arr),
            [InputConversionType.JOIN_NONE]: (arr) => Array.isArray(arr) ? arr.join("") : String(arr),
            [InputConversionType.AS_IS]: (val) => val
        };

        const action = conversionActions[conversionType];
        if (action) {
            return action(inputValue);
        } else {
            logToErrorStream(`Warning: Unknown conversion type '${conversionType}' requested. Returning input value as-is.`);
            return inputValue;
        }
    } catch (conversionError) {
        logToErrorStream(`Error during input conversion (type ${conversionType}, value: ${inputValue}): ${conversionError.message}. Returning original value.`);
        return inputValue;
    }
}

/**
 * Records and logs performance metrics (execution time and memory usage) to the error stream.
 * @param {number} elapsedTimeMs The total time elapsed in milliseconds.
 */
function recordPerformanceMetrics(elapsedTimeMs) {
    logToErrorStream(`\n--- Performance Metrics ---`);
    logToErrorStream(`Execution Time : ${elapsedTimeMs} ms`);
    // Using process.memoryUsage().heapUsed for a more application-specific memory consumption metric.
    logToErrorStream(`Memory Usage : ${Math.round(process.memoryUsage().heapUsed / 1024)} KB (Heap Used)`);
    logToErrorStream(`--- Application End ---`);
}


// --- Main Application Logic ---
// This is the core problem-solving part of the code.

/**
 * Executes the primary logic of the application.
 * Reads input parameters and calculates the minimum cost based on two pricing models.
 */
function executeMainLogic() {
    // Read the first line of input, expecting three integers representing N, A, and B.
    const initialParameters = retrieveNextIntArray();

    // Basic validation: ensure we received an array with at least three numbers.
    if (!Array.isArray(initialParameters) || initialParameters.length < 3 || initialParameters.some(isNaN)) {
        throw new Error("Input error: Expected three valid numerical parameters on the first line.");
    }

    const itemCount = initialParameters[0];
    const costPerItem = initialParameters[1];
    const fixedCost = initialParameters[2];

    // More detailed validation: log warnings for potentially problematic input values.
    if (itemCount < 0 || costPerItem < 0 || fixedCost < 0) {
        logToErrorStream(`Warning: Negative input values detected (N=${itemCount}, A=${costPerItem}, B=${fixedCost}). Calculations will proceed.`);
    }
    if (itemCount === 0 && costPerItem > 0) {
        logToErrorStream(`Notice: Item count is zero, variable cost will be zero regardless of cost per item.`);
    }

    // Calculate the total cost if items are charged individually.
    const totalVariableCost = itemCount * costPerItem;

    let finalCalculatedCharge;
    // Determine the final charge by comparing the total variable cost with the fixed cost.
    // This is a rephrasing of Math.min(fixedCost, totalVariableCost) using a conditional.
    if (totalVariableCost < fixedCost) {
        finalCalculatedCharge = totalVariableCost;
    } else {
        finalCalculatedCharge = fixedCost;
    }

    // Output the final calculated charge to the standard output.
    outputResult(finalCalculatedCharge);
}