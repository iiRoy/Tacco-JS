'use strict';

// A constant representing a value that effectively "removes" an element from consideration
// by being larger than any valid input number.
const EXCLUDED_VALUE_MARKER = Number.MAX_SAFE_INTEGER;

/**
 * Parses a string into a positive integer, with a fallback for invalid inputs.
 * @param {string} strValue - The string to parse.
 * @param {number} [defaultValue=0] - The value to return if parsing fails or result is negative.
 * @returns {number} The parsed positive integer or the default value.
 */
const retrievePositiveInteger = (strValue, defaultValue = 0) => {
    const parsedNumber = parseInt(strValue, 10);
    // Validate if the parsed result is a number and non-negative.
    if (isNaN(parsedNumber) || parsedNumber < 0) {
        return defaultValue;
    }
    return parsedNumber;
};

/**
 * Processes an array of input lines to find and output indices of smallest elements.
 * The core logic involves iteratively finding the smallest element, outputting its 1-based index,
 * and then marking it for exclusion in subsequent iterations.
 * @param {string[]} inputLinesCollection - An array where the first element is 'n' (count)
 *                                         and the second is a space-separated string of numbers.
 */
const executeMinimumIndexExtraction = (inputLinesCollection) => {
    // Initial validation of the input structure.
    if (!inputLinesCollection || inputLinesCollection.length < 2) {
        console.error("Input processing terminated: Insufficient data lines provided.");
        return;
    }

    // Parse the desired number of iterations from the first line.
    const requestedIterationCount = retrievePositiveInteger(inputLinesCollection[0]);

    // Parse the array of numeric values from the second line.
    // Invalid numbers are replaced with the EXCLUDED_VALUE_MARKER to prevent issues.
    let mutableNumericDataSet = inputLinesCollection[1].split(' ').map(textItem => {
        const convertedNum = parseInt(textItem, 10);
        return isNaN(convertedNum) ? EXCLUDED_VALUE_MARKER : convertedNum;
    });

    // Ensure there are actual numbers to process.
    if (mutableNumericDataSet.length === 0) {
        console.warn("No valid numeric values were found in the input array.");
        return;
    }

    // Determine the actual number of iterations to perform,
    // capping it at the available number of elements.
    const actualOperationLimit = Math.min(requestedIterationCount, mutableNumericDataSet.length);

    // Main loop to find and "extract" the smallest elements.
    for (let currentOperationIndex = 0; currentOperationIndex < actualOperationLimit; ++currentOperationIndex) {
        let minimumObservedValue = EXCLUDED_VALUE_MARKER; // Start with a value higher than any expected element.
        let positionOfMinimum = -1; // Initialize with an invalid index.

        // Iterate through the current data set to find the smallest valid element.
        for (let dataPointPosition = 0; dataPointPosition < mutableNumericDataSet.length; ++dataPointPosition) {
            const currentValue = mutableNumericDataSet[dataPointPosition];

            // Only consider values that are smaller than the current minimum and not marked as excluded.
            if (currentValue < minimumObservedValue) {
                minimumObservedValue = currentValue;
                positionOfMinimum = dataPointPosition;
            }
        }

        // If no valid minimum was found in the current pass (e.g., all elements were marked as excluded).
        if (positionOfMinimum === -1) {
            console.error(`Error: Could not locate a valid minimum element during iteration ${currentOperationIndex + 1}. Aborting.`);
            break; // Exit the loop if no minimum can be found.
        }

        // Output the 1-based index of the smallest element found.
        console.log(positionOfMinimum + 1);

        // "Remove" the found element by replacing it with the marker,
        // so it won't be considered in subsequent iterations.
        mutableNumericDataSet[positionOfMinimum] = EXCLUDED_VALUE_MARKER;
    }
};

// Entry point for execution: Reads from standard input and invokes the main processing function.
try {
    const fileContents = require("node:fs").readFileSync("/dev/stdin", "utf8");
    const parsedInputLines = fileContents.split('\n');
    executeMinimumIndexExtraction(parsedInputLines);
} catch (ioError) {
    console.error("An error occurred while reading or processing input:", ioError.message);
    // Exit with an error code to signal failure in automated environments.
    process.exit(1);
}