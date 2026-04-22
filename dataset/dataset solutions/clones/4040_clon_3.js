/**
 * This module orchestrates data input and performs a specific numerical evaluation.
 * It supports both a development/mock input scenario and a production standard input (stdin) reading.
 */

/**
 * @function MockInputProvider
 * @description Configures a function to supply predefined string data, simulating input for testing or development.
 * @returns {function(): string} A callable entity that yields a static, hardcoded input string.
 */
const MockInputProvider = function () {
    // Define the static data components for the simulated input stream.
    const firstTestDatum = "431";
    const secondTestDatum = "321";

    /**
     * @inner
     * @function acquireInputContent
     * @description Provides the combined simulated input string.
     * @returns {string} The hardcoded input string, structured as if from a multi-line source.
     */
    const acquireInputContent = function () {
        // Concatenate the data parts, separated by a newline character to mimic typical input streams.
        return `${firstTestDatum}\n${secondTestDatum}`;
    };
    return acquireInputContent;
};


/**
 * @function ProductionInputHandler
 * @description Establishes a mechanism for retrieving data directly from the system's standard input.
 * @returns {function(): string} A callable entity designed to read content from '/dev/stdin'.
 */
const ProductionInputHandler = function () {
    // Lazily load the Node.js file system module for I/O operations.
    const fileSystemModule = require('node:fs');

    /**
     * @inner
     * @function acquireInputContent
     * @description Reads data from the standard input file path.
     * @returns {string} The content read from `/dev/stdin`, or a default error string if an issue occurs.
     */
    const acquireInputContent = function () {
        let actualInputBuffer = ''; // Initialize a buffer to store the incoming data.
        try {
            // Attempt to read the entire file synchronously, specifying encoding and read flag.
            actualInputBuffer = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
        } catch (readOperationError) {
            // If any error occurs during file reading, log a critical message.
            console.error("CRITICAL: Failed to read from standard input stream:", readOperationError.message);
            // Provide a robust fallback to prevent application crashes, mimicking an empty or invalid input.
            actualInputBuffer = "0\n0";
        }
        return actualInputBuffer;
    };
    return acquireInputContent;
};


// A global configuration switch to toggle between development and production input sources.
// Set to `true` for development-specific behavior (e.g., mock data), `false` for live environment.
const isDevelopmentModeActive = false;

// Dynamically select the appropriate input source function based on the operational mode flag.
let currentlyActiveDataSource;
if (isDevelopmentModeActive) {
    currentlyActiveDataSource = MockInputProvider();
} else {
    currentlyActiveDataSource = ProductionInputHandler();
}

// Retrieve the raw string data from the selected source.
const rawDataStringObtained = currentlyActiveDataSource();
// Split the raw string into individual line segments.
const individualLineSegments = rawDataStringObtained.split('\n');

// Process each line segment, converting it into a numerical value.
// Includes robust error handling for non-numeric or empty inputs.
const processedNumericalValues = individualLineSegments.map(segment => {
    const trimmedSegmentContent = segment.trim(); // Remove leading/trailing whitespace.
    const convertedNumericValue = Number(trimmedSegmentContent); // Attempt conversion to a number.

    if (Number.isNaN(convertedNumericValue) || trimmedSegmentContent === '') {
        // If conversion results in NaN or the segment was empty, issue a warning and default to zero.
        console.warn(`WARNING: Encountered non-numeric or empty input fragment: '${trimmedSegmentContent}'. Defaulting this value to 0.`);
        return 0;
    }
    return convertedNumericValue;
});

// Declare variables for the two primary operands required for the calculation.
let firstMainOperand = 0;
let secondMainOperand = 0;

// Safely extract the operands from the processed array, checking for sufficient data.
if (processedNumericalValues.length >= 2) {
    firstMainOperand = processedNumericalValues[0];
    secondMainOperand = processedNumericalValues[1];
} else if (processedNumericalValues.length === 1) {
    firstMainOperand = processedNumericalValues[0];
    console.warn("NOTICE: Only a single numerical operand was provided. The second operand will default to zero.");
} else {
    // If no valid numerical entries are present, both operands will remain at their default (zero).
    console.error("ERROR: Insufficient numerical input. Both primary operands are set to zero.");
}

// Compute the final result based on the divisibility condition.
let finalComputedOutcome;

// Explicitly handle the edge case where the divisor is zero.
// In JavaScript, X % 0 results in NaN. NaN === 0 evaluates to false.
// Therefore, the original logic would proceed to the 'else' branch and print X.
if (secondMainOperand === 0) {
    finalComputedOutcome = firstMainOperand; // Mimic the original behavior for divisor zero.
} else if (firstMainOperand % secondMainOperand === 0) {
    // If the first operand is perfectly divisible by the second, the outcome is -1.
    finalComputedOutcome = -1;
} else {
    // Otherwise, the outcome is simply the value of the first operand.
    finalComputedOutcome = firstMainOperand;
}

// Output the final calculated outcome to the standard console.
console.log(finalComputedOutcome);