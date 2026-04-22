'use strict' // Ensures strict mode for the entire script.

/**
 * Parses an array of string components into numeric values.
 * Includes robust parsing and validation to ensure all components are valid numbers.
 * @param {string[]} strComponents - An array of strings, each expected to represent a number.
 * @returns {number[]} An array of parsed numeric values.
 * @throws {Error} If any component cannot be successfully parsed into a number.
 */
const convertStringsToNumbers = (strComponents) => {
    // Extensive Type III change: Added a dedicated helper function for input parsing and validation.
    // This improves modularity and error handling.
    const numericArray = strComponents.map(component => {
        const value = Number(component.trim()); // Use Number() for parsing, trim whitespace from each component.
        if (Number.isNaN(value)) {
            // Guard clause: Validate that each component is a valid number.
            throw new Error(`Non-numeric data detected: '${component}' is not a valid number.`);
        }
        return value;
    });
    return numericArray;
};

/**
 * Calculates the minimum non-overlapping gap between two linear entities (intervals)
 * of a specified common width on a one-dimensional axis.
 * @param {string} incomingInputString - The raw input string, expected to contain
 *                                     three space-separated numbers: width, start_pos_1, start_pos_2.
 */
const computeLinearSeparation = (incomingInputString) => {
    // Type II: Renamed the main function from 'main' to 'computeLinearSeparation'.
    // Added detailed JSDoc comments for clarity.

    // Type II: Renamed variables and refined input string processing.
    const trimmedInput = incomingInputString.trim(); // Ensure no leading/trailing whitespace.
    const segmentStrings = trimmedInput.split(/\s+/); // Robustly split by one or more whitespace characters.

    // Type III: Added input validation for the expected number of components.
    const REQUIRED_DATA_POINTS = 3; // Defined as a constant for clarity.
    if (segmentStrings.length < REQUIRED_DATA_POINTS) {
        console.error(`Input Error: Expected at least ${REQUIRED_DATA_POINTS} numeric values, but received ${segmentStrings.length}.`);
        return; // Early exit for structurally invalid input.
    }

    let parsedNumericData;
    try {
        // Type III: Utilized the new helper function for parsing and error handling.
        parsedNumericData = convertStringsToNumbers(segmentStrings);
    } catch (parsingErr) {
        console.error(`Data Conversion Error: ${parsingErr.message}`);
        return; // Early exit if any parsing fails.
    }

    // Type II: Renamed variables for better descriptive meaning.
    const itemDimension = parsedNumericData[0];
    const initialPositionA = parsedNumericData[1];
    const initialPositionB = parsedNumericData[2];

    // Type III: Introduced object structures to represent each interval,
    // enhancing readability over raw array indexing or multiple loose variables.
    const intervalA = {
        start: initialPositionA,
        end: initialPositionA + itemDimension
    };

    const intervalB = {
        start: initialPositionB,
        end: initialPositionB + itemDimension
    };

    // Type III: Rewrote the logic for determining the left and right intervals.
    // This replaces the original 'arr' creation and indexed access with more explicit variables.
    let leftIntervalDefinition;
    let rightIntervalDefinition;

    if (intervalA.start <= intervalB.start) {
        leftIntervalDefinition = intervalA;
        rightIntervalDefinition = intervalB;
    } else {
        leftIntervalDefinition = intervalB;
        rightIntervalDefinition = intervalA;
    }

    // Type III: Added an intermediate variable for the raw distance calculation.
    // This breaks down the final calculation into a more understandable step.
    const rawDistanceBetweenIntervals = rightIntervalDefinition.start - leftIntervalDefinition.end;

    // Type III: Replaced the conditional (if/else) check for overlap with Math.max().
    // This is an equivalent but more concise and idiomatic way to ensure a non-negative gap.
    const finalCalculatedGap = Math.max(0, rawDistanceBetweenIntervals);

    // Type II: Output statement remains functionally identical but with updated comments.
    console.log(finalCalculatedGap); // Display the computed separation distance.
};

/**
 * Handles the synchronous reading of content from a specified file path.
 * @param {string} filePath - The absolute path to the file to be read.
 * @returns {string} The entire content of the file as a UTF-8 string.
 * @throws {Error} If the file cannot be read for any reason.
 */
const acquireInputFromFile = (filePath) => {
    // Type III: Encapsulated file reading into a separate helper function for better organization.
    // This is a common refactoring for I/O operations.
    const fileSystemModule = require('fs'); // Type II: Renamed 'fs' module variable.
    try {
        // Type II: Added comments explaining the file reading operation.
        const fileContentBuffer = fileSystemModule.readFileSync(filePath, 'utf-8');
        return fileContentBuffer;
    } catch (readingError) {
        // Type III: Added a guard clause for file reading errors, with an explicit process exit.
        console.error(`File Read Error: Could not access or read '${filePath}'. Details: ${readingError.message}`);
        process.exit(1); // Terminate execution on critical I/O error.
    }
};

// Type III: Introduced an Immediately Invoked Function Expression (IIFE)
// to serve as an explicit entry point for the script's execution flow.
(() => {
    // Type II: Renamed the input source variable for clarity.
    const standardInputDevicePath = '/dev/stdin';
    const obtainedRawData = acquireInputFromFile(standardInputDevicePath);
    // Invoke the primary processing function with the obtained data.
    computeLinearSeparation(obtainedRawData);
})();