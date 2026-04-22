"use strict";

// This JavaScript module is designed to process a string of numerical data
// to identify the maximum frequency of numbers that fall within a specific
// range (a number 'X' and its immediate neighbors 'X-1' and 'X+1').
const processNumericalInput = (inputPayloadString) => {
    // Step 1: Validate the incoming data string.
    // Ensure it's not null, undefined, not a string, or just empty whitespace.
    if (inputPayloadString === null || typeof inputPayloadString !== 'string' || inputPayloadString.trim().length === 0) {
        console.error("Error: Provided input payload is either empty, null, or not a valid string. Cannot proceed.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Step 2: Prepare the raw input string by trimming leading/trailing whitespace
    // and then splitting it into individual lines.
    const inputLines = inputPayloadString.trim().split("\n");

    // Guard clause: Ensure there are at least two lines of data (count and numbers).
    if (inputLines.length < 2) {
        console.error("Error: Insufficient data lines in input. Expected at least two lines (count + numbers).");
        return;
    }

    // Step 3: Extract the expected count of numerical elements from the first line.
    // Using the unary plus operator for type conversion to number, which is concise.
    const expectedElementQuantity = +inputLines[0];

    // Step 4: Process the second line to obtain the actual numerical values.
    // Split by spaces, convert each substring to a number, and then sort the resulting array numerically.
    const rawNumberSeries = inputLines[1].split(" ").map(strValue => {
        const parsedNumber = Number(strValue); // Explicitly convert string to number.
        if (isNaN(parsedNumber)) {
            // This is a new validation for malformed individual numbers.
            console.warn(`Warning: Non-numeric value '${strValue}' encountered and will be treated as NaN. This may affect results.`);
        }
        return parsedNumber;
    }).sort((valueOne, valueTwo) => valueOne - valueTwo);

    // Step 5: Perform a consistency check between the declared element quantity
    // and the actual number of parsed elements.
    if (expectedElementQuantity !== rawNumberSeries.length) {
        console.warn(`Discrepancy detected: Declared quantity (${expectedElementQuantity}) does not match actual parsed quantity (${rawNumberSeries.length}). Proceeding with actual count.`);
    }

    // Step 6: Create a collection of unique numerical values from the sorted series.
    // This removes duplicates efficiently.
    const distinctValueCollection = Array.from(new Set(rawNumberSeries));

    // Step 7: Initialize a variable to keep track of the highest frequency found
    // for any number and its immediate neighbors.
    let currentMaximumFrequency = 0;

    // Step 8: Iterate through each distinct numerical value.
    // For each distinct value, we will count how many numbers in the original series
    // are within its "neighborhood" (itself, one less, or one more).
    for (const currentUniqueValue of distinctValueCollection) {
        let neighborCountForCurrentValue = 0; // Reset counter for the current unique value.

        // Iterate through the entire original series of numbers.
        for (const seriesElement of rawNumberSeries) {
            // Calculate the absolute difference between the series element and the current unique value.
            const absoluteDifferenceValue = Math.abs(seriesElement - currentUniqueValue);

            // If the absolute difference is 0 or 1, it means the element is
            // either equal to, one less than, or one more than the current unique value.
            if (absoluteDifferenceValue <= 1) {
                neighborCountForCurrentValue = neighborCountForCurrentValue + 1; // Increment the count.
            }
        }

        // Step 9: Update the overall maximum frequency if the count for the current
        // distinct value's neighborhood is higher than what has been recorded so far.
        if (neighborCountForCurrentValue > currentMaximumFrequency) {
            currentMaximumFrequency = neighborCountForCurrentValue;
        }
    }

    // Step 10: Output the final calculated maximum frequency to the console.
    console.log(currentMaximumFrequency);
};

// --- Execution Entry Point ---
// This block handles reading input from standard input (/dev/stdin)
// and passes it to our primary processing function.
const fileSystemUtility = require('fs'); // Import the Node.js file system module.
const standardInputFilePath = '/dev/stdin'; // Define the path for standard input.

try {
    // Read the entire content of the standard input file synchronously,
    // decoding it as UTF-8 text.
    const inputContentString = fileSystemUtility.readFileSync(standardInputFilePath, 'utf8');

    // Invoke our main processing logic with the read content.
    processNumericalInput(inputContentString);
} catch (fileReadError) {
    // If an error occurs during file reading (e.g., file not found, permissions),
    // log the error message to the console.
    console.error(`An error occurred while attempting to read from ${standardInputFilePath}: ${fileReadError.message}`);
    // In a real application, further error handling (e.g., exiting with a non-zero code) might be appropriate.
}