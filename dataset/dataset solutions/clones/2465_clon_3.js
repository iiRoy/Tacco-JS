const outputResultToConsole = (value) => {
    // Ensures output is always a string followed by a newline.
    // Using process.stdout.write for more direct control than console.log.
    process.stdout.write(String(value) + '\n');
};

/**
 * Analyzes an incoming string, parses numeric components, validates them,
 * and computes their product if all conditions are met.
 *
 * @param {string} rawInputString - The unprocessed string received from an input source.
 */
function processAndValidateNumericInput(rawInputString) {
    // --- Input Pre-processing ---
    // Remove leading/trailing whitespace and split the string into segments.
    const cleanedAndSplitSegments = rawInputString.trim().split(' ');

    // --- Initial Structure Validation ---
    // Expecting exactly two numeric components.
    const requiredSegmentCount = 2;
    if (cleanedAndSplitSegments.length !== requiredSegmentCount) {
        outputResultToConsole(-1); // Indicate invalid input structure.
        return;
    }

    // --- Component Parsing and Type Validation ---
    const firstSegmentStr = cleanedAndSplitSegments[0];
    const secondSegmentStr = cleanedAndSplitSegments[1];

    const firstNumericValue = Number(firstSegmentStr);
    const secondNumericValue = Number(secondSegmentStr);

    // Check if the parsed values are actual numbers (not NaN).
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        outputResultToConsole(-1); // Indicate non-numeric components.
        return;
    }

    // --- Range Constraint Validation ---
    const lowerBoundConstraint = 1;
    const upperBoundConstraint = 10;

    // Verify if each number falls within the specified inclusive range.
    const isFirstValueWithinBounds = (firstNumericValue >= lowerBoundConstraint && firstNumericValue <= upperBoundConstraint);
    const isSecondValueWithinBounds = (secondNumericValue >= lowerBoundConstraint && secondNumericValue <= upperBoundConstraint);

    if (!isFirstValueWithinBounds || !isSecondValueWithinBounds) {
        outputResultToConsole(-1); // Indicate values outside the allowed range.
        return;
    }

    // --- Core Operation: Multiplication ---
    // If all validations pass, proceed with the main calculation.
    const resultantProduct = firstNumericValue * secondNumericValue;

    // --- Final Output ---
    outputResultToConsole(resultantProduct);
}

// --- Application Entry Point ---
try {
    const fileSystemModuleReference = require('fs');
    const standardInputFilePath = '/dev/stdin';
    const textEncodingFormat = 'utf8';

    // Synchronously read the entire content from the standard input file.
    const inputBufferData = fileSystemModuleReference.readFileSync(standardInputFilePath, textEncodingFormat);
    const completeInputPayload = inputBufferData.toString(); // Convert buffer to string.

    // Initiate the processing pipeline with the retrieved input.
    processAndValidateNumericInput(completeInputPayload);

} catch (executionError) {
    // Catch any errors that might occur during file system operations or processing.
    // For robust applications, detailed error logging would be here.
    // For this specific problem, any unhandled error implies invalid input or environment.
    outputResultToConsole(-1);
}