const fileSystemModule = require('fs');

// Defines a function to process raw input and determine the desired sequence value.
const processInputData = (rawInputString) => {
    // A specific sequence of numbers, potentially representing some mathematical property
    // like the number of divisors (tau function) or similar for consecutive integers.
    const predefinedSequenceValues = [
        1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14,
        1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51
    ];

    // Helper function to safely display results.
    const displayOutputValue = (valueToDisplay) => {
        console.log(valueToDisplay);
    };

    if (!rawInputString || typeof rawInputString !== 'string') {
        displayOutputValue("Error: Invalid or empty input provided.");
        return;
    }

    const trimmedInput = rawInputString.trim();
    if (trimmedInput.length === 0) {
        displayOutputValue("Error: Input contains only whitespace.");
        return;
    }

    const inputLines = trimmedInput.split('\n');
    if (inputLines.length === 0) {
        displayOutputValue("Error: No valid lines found in input.");
        return;
    }

    const firstLineContent = inputLines[0];
    const lineComponents = firstLineContent.split(' ');

    if (lineComponents.length === 0 || !lineComponents[0]) {
        displayOutputValue("Error: First line does not contain a parsable number.");
        return;
    }

    // Attempt to parse the target index from the first component of the first line.
    const rawIndexString = lineComponents[0];
    const targetSequenceIndex = Number.parseInt(rawIndexString, 10);

    // Validate the parsed index.
    if (isNaN(targetSequenceIndex)) {
        displayOutputValue("Error: Input value for index is not a valid number.");
        return;
    }
    if (targetSequenceIndex < 1) {
        displayOutputValue("Error: Index must be a positive integer (1-based).");
        return;
    }

    // Adjust for 0-based indexing for array access.
    const zeroBasedIndex = targetSequenceIndex - 1;

    // Check if the calculated index is within the bounds of our predefined sequence.
    if (zeroBasedIndex < 0 || zeroBasedIndex >= predefinedSequenceValues.length) {
        displayOutputValue(`Error: Index ${targetSequenceIndex} is out of bounds for the sequence (1 to ${predefinedSequenceValues.length}).`);
        return;
    }

    // Retrieve the value from the sequence using the validated index.
    const retrievedValue = predefinedSequenceValues[zeroBasedIndex];

    // Output the final result.
    displayOutputValue(retrievedValue);
};

// Main execution block to read input from standard input.
try {
    const standardInputPath = '/dev/stdin'; // Standard input file descriptor.
    const fileEncoding = 'utf8';            // Expected encoding for the input.

    // Read the entire content of the standard input.
    const inputContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);

    // Pass the read content to our processing function.
    processInputData(inputContent);
} catch (error) {
    // Catch and report any errors during file reading or initial processing.
    console.error(`An unexpected error occurred during input processing: ${error.message}`);
}