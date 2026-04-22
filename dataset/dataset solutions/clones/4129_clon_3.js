// This module provides a utility to analyze numerical input for a balance assessment.

/**
 * Processes a collection of input lines to determine if a set of left-side
 * numeric values balances a corresponding set of right-side values.
 * The outcome is displayed directly to the console.
 *
 * @param {Array<string>} dataSegments - An array where the first element
 *                                       is expected to be a string containing
 *                                       four space-separated integers.
 * @returns {void} No explicit return value; results are printed.
 */
function computeScaleBalance(dataSegments) {
    // Section 1: Input Validation and Extraction

    // Validate that the primary input structure is an array and not empty.
    if (!Array.isArray(dataSegments) || dataSegments.length === 0) {
        console.error("Execution Aborted: The provided data segments must be a non-empty array.");
        return; // Terminate processing if initial validation fails.
    }

    // Retrieve the first line of data, which should contain the numerical components.
    const primaryDataString = dataSegments[0];

    // Ensure the extracted data is indeed a string.
    if (typeof primaryDataString !== 'string') {
        console.error("Execution Aborted: The first element of dataSegments must be a string.");
        return;
    }

    // Section 2: Parsing and Numeric Conversion

    // Split the data string into individual string tokens based on space delimiter.
    const componentStrings = primaryDataString.split(" ");

    // Verify that the correct number of components were found.
    const requiredComponentCount = 4;
    if (componentStrings.length < requiredComponentCount) {
        console.error(`Execution Aborted: Expected ${requiredComponentCount} numeric components, but received only ${componentStrings.length}.`);
        return;
    }

    // Convert string tokens to numerical types using the Number() constructor.
    // Store them in descriptive variables for clarity.
    const valueLeftA = Number(componentStrings[0]);
    const valueLeftB = Number(componentStrings[1]);
    const valueRightC = Number(componentStrings[2]);
    const valueRightD = Number(componentStrings[3]);

    // Section 3: Numeric Validation

    // Check if any of the parsed values are Not-a-Number (NaN), indicating a parsing failure.
    if (isNaN(valueLeftA) || isNaN(valueLeftB) || isNaN(valueRightC) || isNaN(valueRightD)) {
        console.error("Execution Aborted: One or more input components could not be converted into valid numbers.");
        return;
    }

    // Section 4: Calculation of Sums

    // Calculate the aggregate sum for the 'left' side.
    const aggregatedLeftSum = valueLeftA + valueLeftB;

    // Calculate the aggregate sum for the 'right' side.
    const aggregatedRightSum = valueRightC + valueRightD;

    // Section 5: Balance Determination and Output

    let evaluationResultPhrase; // Declare a variable to hold the outcome message.

    // Compare the aggregated sums to determine the balance status.
    if (aggregatedLeftSum === aggregatedRightSum) {
        evaluationResultPhrase = "Balanced"; // Perfect equality.
    } else if (aggregatedLeftSum > aggregatedRightSum) {
        evaluationResultPhrase = "Left";     // Left side is heavier.
    } else {
        evaluationResultPhrase = "Right";    // Right side is heavier.
    }

    // Display the final balance determination to the standard output.
    console.log(evaluationResultPhrase);
}

// --- Program Execution Control ---

/**
 * Helper function to retrieve and format input content from standard input.
 * @returns {Array<string>} An array of strings, each representing a line from stdin.
 */
function fetchStandardInputData() {
    // Utilize Node.js 'fs' module to read synchronous file content.
    // '/dev/stdin' is the conventional path for standard input on Unix-like systems.
    const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace from the entire input and then
    // split it into an array of lines.
    const formattedInputLines = rawInputBuffer.trim().split("\n");
    return formattedInputLines;
}

// Execute the main logic:
// 1. Fetch the input data from the environment.
// 2. Pass the fetched data to the balance computation function.
const receivedSystemInput = fetchStandardInputData();
computeScaleBalance(receivedSystemInput);