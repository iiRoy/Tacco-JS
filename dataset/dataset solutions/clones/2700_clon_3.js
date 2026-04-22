'use strict';

const processInputData = (rawTextData) => {
    // Initial validation for the raw input string
    if (typeof rawTextData !== 'string' || rawTextData.trim().length === 0) {
        console.error("Error: Input data is empty or invalid type.");
        return; // Exit if input is fundamentally flawed
    }

    // Split the input into individual lines
    let dataLines = rawTextData.split('\n');

    // Filter out any lines that are purely whitespace or empty
    dataLines = dataLines.filter(line => line.trim().length > 0);

    // Ensure we have at least two meaningful lines: element count and the sequence itself
    if (dataLines.length < 2) {
        console.error("Error: Insufficient meaningful data lines after filtering.");
        return;
    }

    // Process the first line to get the expected number of elements
    const countString = dataLines[0];
    const anticipatedElementCount = Number(countString);

    // Validate the anticipated element count
    if (isNaN(anticipatedElementCount) || anticipatedElementCount <= 0 || !Number.isInteger(anticipatedElementCount)) {
        console.error("Error: The first line must contain a positive integer representing element count.");
        return;
    }

    // Process the second line containing the space-separated numbers
    const numberSequenceString = dataLines[1];
    const stringTokens = numberSequenceString.split(' ');

    const numericSequenceContainer = [];
    for (const token of stringTokens) {
        const numericValue = Number(token);
        if (isNaN(numericValue)) {
            console.error(`Error: Found non-numeric value '${token}' in the sequence data.`);
            return;
        }
        numericSequenceContainer.push(numericValue);
    }

    // Optional: Validate the actual number of parsed elements against the anticipated count
    if (numericSequenceContainer.length !== anticipatedElementCount) {
        console.warn(`Warning: Expected ${anticipatedElementCount} elements as per first line, but parsed ${numericSequenceContainer.length}. Proceeding.`);
    }

    // Execute the core logic and output the result
    const finalResult = determineSequenceOrderDeviation(numericSequenceContainer);
    console.log(finalResult);
};

const determineSequenceOrderDeviation = (inputArrayOfNumbers) => {
    // Guard clause for invalid or empty input arrays
    if (!Array.isArray(inputArrayOfNumbers) || inputArrayOfNumbers.length === 0) {
        return "NO"; // An empty or invalid array cannot satisfy the condition
    }

    // Create a new array reference to avoid modifying the original, if needed elsewhere
    const currentSequenceSnapshot = [...inputArrayOfNumbers];

    let totalDiscrepancies = 0;
    const maximumPermissibleDiscrepancies = 2; // Helper constant for clarity

    // Iterate through the array using a traditional for loop
    for (let currentIdx = 0; currentIdx < currentSequenceSnapshot.length; currentIdx++) {
        const actualElementValue = currentSequenceSnapshot[currentIdx];
        const expectedOrdinalPosition = currentIdx + 1; // 1-based indexing for comparison

        // Check for deviation from the expected ordered sequence
        if (actualElementValue !== expectedOrdinalPosition) {
            totalDiscrepancies++;

            // Early exit: if deviations exceed the limit, no need to check further
            if (totalDiscrepancies > maximumPermissibleDiscrepancies) {
                return 'NO';
            }
        }
    }

    // If the loop completes without exceeding the discrepancy limit
    if (totalDiscrepancies <= maximumPermissibleDiscrepancies) {
        return 'YES';
    } else {
        // This branch should ideally not be reached due to the early exit,
        // but it provides a clear fallback.
        return 'NO';
    }
};

// Main execution block to read from standard input
const fileSystemUtility = require('fs');
const standardInputFile = '/dev/stdin';
const textEncodingStandard = 'utf8';

try {
    const fileContentBuffer = fileSystemUtility.readFileSync(standardInputFile, textEncodingStandard);
    processInputData(fileContentBuffer);
} catch (error) {
    console.error(`Failed to read from standard input: ${error.message}`);
    // Potentially log more details or exit with a non-zero status
}