'use strict';

// --- Configuration Constants (Type III: new fragments, helper variables) ---
// Define the standard radix for integer parsing to enhance clarity and maintainability.
const PARSING_RADIX_BASE = 10;
// Specify the default input stream path for data acquisition.
const STANDARD_INPUT_SOURCE_PATH = "/dev/stdin";

/**
 * Parses a string line containing space-separated numeric values into an array of integers.
 * Includes robust error handling for individual parsing failures.
 * (Type II: renamed function, parameter; Type III: added JSDoc, error handling, comments)
 *
 * @param {string} lineContent - A single string line expected to contain numbers.
 * @returns {number[]} An array of parsed integer values. Returns empty if input is invalid.
 */
const parseNumericLineSegments = (lineContent) => {
    // Type III: Guard clause for empty or non-string input
    if (typeof lineContent !== 'string' || lineContent.trim().length === 0) {
        console.warn("Input line for parsing was empty or not a string. Returning an empty array.");
        return [];
    }

    // Type III: Introduce a temporary variable for split segments
    const stringSegments = lineContent.trim().split(' ');

    // Type III: Add a filter to remove empty strings in case of multiple spaces
    const cleanSegments = stringSegments.filter(segment => segment.length > 0);

    // Type II: Renamed map callback parameter
    const parsedIntegerValues = cleanSegments.map(numericStringSegment => {
        const parsedValue = parseInt(numericStringSegment, PARSING_RADIX_BASE);
        // Type III: Enhanced validation for individual parsed values
        if (isNaN(parsedValue)) {
            console.error(`Warning: Encountered non-numeric segment "${numericStringSegment}". Treating as zero.`);
            return 0; // Default to 0 for invalid numbers to maintain array structure
        }
        return parsedValue;
    });

    return parsedIntegerValues;
};

/**
 * Executes the core conditional subtraction logic based on three input numbers.
 * (Type II: renamed function, parameters; Type III: added JSDoc, intermediate variables, if/else, comments)
 *
 * @param {number[]} numericOperands - An array containing at least three numbers.
 * @returns {number} The calculated result, which is either (secondary + tertiary - primary) or 0.
 */
const processNumericComparison = (numericOperands) => {
    // Type III: Guard clause for insufficient operands
    if (!Array.isArray(numericOperands) || numericOperands.length < 3) {
        console.error("Error: Insufficient numeric operands provided for comparison. Expected at least 3.");
        return 0; // Return a default value to prevent errors downstream
    }

    // Type II: Renamed variables for operands
    const primaryValue = numericOperands[0];
    const secondaryValue = numericOperands[1];
    const tertiaryValue = numericOperands[2];

    // Type III: Introduce intermediate variables for calculation steps
    const sumOfDependentValues = secondaryValue + tertiaryValue;
    const comparisonTarget = primaryValue;

    let finalCalculatedOutcome = 0; // Type III: Explicitly declare and initialize result variable

    // Type III: Rewrite conditional expression as an if-else block for explicit flow
    if (sumOfDependentValues > comparisonTarget) {
        // Type III: Add another intermediate step for the difference
        const positiveDifference = sumOfDependentValues - comparisonTarget;
        finalCalculatedOutcome = positiveDifference;
    } else {
        // If the condition is not met, the outcome remains zero as initialized.
        // This 'else' block could be omitted if 'finalCalculatedOutcome' was initialized to 0,
        // but explicitly stating it makes the logic clearer. (Type III: update/clarification)
        finalCalculatedOutcome = 0;
    }

    // Type III: Add a debug log (can be removed in production)
    // console.log(`Debug: primary=${primaryValue}, secondary=${secondaryValue}, tertiary=${tertiaryValue}, sum=${sumOfDependentValues}, outcome=${finalCalculatedOutcome}`);

    return finalCalculatedOutcome;
};

/**
 * Orchestrates the entire process: reads input, parses it, performs calculation, and outputs result.
 * (Type II: renamed function; Type III: added JSDoc, error handling, detailed comments, refactored steps)
 *
 * @param {string[]} rawInputLines - An array of raw string lines read from the input source.
 */
const orchestrateExecutionFlow = (rawInputLines) => {
    // Type III: Initial validation of the raw input array
    if (!Array.isArray(rawInputLines) || rawInputLines.length === 0) {
        console.error("No input data lines were provided to the orchestrator. Aborting.");
        return;
    }

    // Type III: Focus on the first relevant line for processing
    const mainDataLine = rawInputLines[0];

    // Type III: Delegate parsing to a dedicated helper function
    const numericDataPoints = parseNumericLineSegments(mainDataLine);

    // Type III: Validate that enough data points were successfully parsed
    if (numericDataPoints.length < 3) {
        console.error(`Insufficient valid numeric data points found in the input line: "${mainDataLine}". Expected at least 3.`);
        return; // Halt execution if critical data is missing
    }

    // Type III: Delegate the core calculation logic
    const finalCalculatedValue = processNumericComparison(numericDataPoints);

    // Type II: Standard output operation
    console.log(finalCalculatedValue);
};

// --- Main Execution Block (Type III: wrapped in try-catch, detailed comments) ---
// This block handles reading from the file system and invoking the primary logic.
try {
    // Type III: Utilize the 'fs' module to synchronously read content from the predefined path.
    // Ensure UTF-8 encoding for proper string interpretation.
    const fileSystemModule = require("fs");
    const rawContentBuffer = fileSystemModule.readFileSync(STANDARD_INPUT_SOURCE_PATH, "utf8");

    // Type III: Split the entire content into an array of lines based on newline characters.
    const individualContentLines = rawContentBuffer.split('\n');

    // Type III: Initiate the main processing sequence with the obtained lines.
    orchestrateExecutionFlow(individualContentLines);

} catch (ioOperationError) {
    // Type III: Implement robust error handling for file I/O operations.
    // This catches issues like file not found, permission errors, etc.
    console.error(`An critical error occurred during input file processing: ${ioOperationError.message}`);
    // Type III: Exit the process with an error code to indicate failure.
    process.exit(1);
}