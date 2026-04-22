'use strict';

// This is the primary function responsible for processing the input data
// and executing the core logic to determine if the numbers satisfy a specific condition.
const processInputData = (inputPayloadString) => {
    // Step 1: Normalize and segment the raw input string.
    // First, remove any leading/trailing whitespace from the entire payload.
    const trimmedPayload = inputPayloadString.trim();

    // Then, split the payload into individual lines based on newline characters.
    const dataLines = trimmedPayload.split('\n');

    // Validate if any input lines were provided.
    if (dataLines.length === 0) {
        console.error("Input processing error: No valid data lines were detected in the payload.");
        return; // Terminate execution early if no data.
    }

    // Step 2: Extract and parse the numeric values from the first data line.
    const primaryDataLine = dataLines[0];

    // Split the primary line by spaces to get string representations of numbers.
    const stringNumberTokens = primaryDataLine.split(' ');

    // Define a helper function to robustly convert string tokens to integers.
    const convertTokenToInteger = (tokenValue) => {
        const integerRepresentation = parseInt(tokenValue, 10);
        // Ensure the conversion resulted in a valid number.
        if (isNaN(integerRepresentation)) {
            // Throw an error if a non-numeric token is found, for clearer error handling.
            throw new Error(`Invalid data format: '${tokenValue}' is not a recognized numeric value.`);
        }
        return integerRepresentation;
    };

    let collectionOfNumbers;
    try {
        // Map each string token to its integer equivalent using the helper function.
        collectionOfNumbers = stringNumberTokens.map(convertTokenToInteger);
    } catch (conversionError) {
        console.error(`Data conversion failed: ${conversionError.message}`);
        return; // Exit if numeric conversion encounters issues.
    }

    // Step 3: Validate the quantity of numbers received.
    // The problem expects exactly three numbers for the comparison.
    const EXPECTED_NUMBER_COUNT = 3;
    if (collectionOfNumbers.length !== EXPECTED_NUMBER_COUNT) {
        console.error(`Data quantity mismatch: Expected ${EXPECTED_NUMBER_COUNT} numbers, but received ${collectionOfNumbers.length}.`);
        return; // Exit if the number count is incorrect.
    }

    // Step 4: Sort the numeric collection in ascending order.
    // Create a shallow copy of the array before sorting to avoid mutating the original
    // 'collectionOfNumbers' array, promoting functional purity.
    const orderedNumericValues = [...collectionOfNumbers].sort((valA, valB) => valA - valB);

    // Step 5: Perform the core logical comparison.
    // Extract the individual values by their sorted position for clarity.
    const firstSmallestNumber = orderedNumericValues[0];
    const secondSmallestNumber = orderedNumericValues[1];
    const largestNumber = orderedNumericValues[2];

    // Calculate the sum of the two smaller numbers.
    const sumOfTwoSmaller = firstSmallestNumber + secondSmallestNumber;

    // Determine the result string based on the comparison.
    const finalOutcome = (largestNumber === sumOfTwoSmaller) ? 'Yes' : 'No';

    // Step 6: Output the determined result.
    console.log(finalOutcome);
};

// This function acts as the application's entry point, handling file reading.
const applicationBootstrap = () => {
    try {
        // Attempt to read the entire content of standard input synchronously.
        const fileContentBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Pass the read content to the main processing function.
        processInputData(fileContentBuffer);
    } catch (readError) {
        // Catch and report any errors that occur during file reading.
        console.error(`File system access error: Could not read from /dev/stdin. Details: ${readError.message}`);
        // Depending on the application, more specific error handling (e.g., for ENOENT) could be added here.
    }
};

// Initialize the application by calling the bootstrap function.
applicationBootstrap();