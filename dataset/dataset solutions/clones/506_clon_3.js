const fileSystemModule = require('fs');

// Define the path for standard input.
const inputSourcePath = '/dev/stdin';

// Specify the exact number of initial data points to process.
const numberOfElementsToProcess = 10;

/**
 * Main execution block to read, process, and sum numeric data.
 * This structure encapsulates the operations for clarity.
 */
try {
    // Read the raw content from the specified input path.
    // The encoding is explicitly set to ensure proper string interpretation.
    let rawContentBuffer = fileSystemModule.readFileSync(inputSourcePath, { encoding: 'utf8' });

    // Clean up the raw string data by removing any leading or trailing whitespace.
    let cleanStringData = rawContentBuffer.trim();

    // Split the cleaned string into individual lines based on the newline character.
    let stringLines = cleanStringData.split('\n');

    // Prepare an array to store the successfully parsed numeric values.
    const numericalSequence = [];

    // Iterate through each string line to parse it into a number.
    // This loop also handles potential empty lines or non-numeric entries.
    for (let lineIndex = 0; lineIndex < stringLines.length; lineIndex++) {
        const currentLineValue = stringLines[lineIndex];

        // Skip any empty lines encountered in the input.
        if (currentLineValue === '') {
            continue;
        }

        // Attempt to convert the string line into a floating-point number.
        const parsedNumber = Number(currentLineValue);

        // Only add the number to our sequence if it's a valid numerical value.
        // Non-numeric lines are effectively ignored for the sequence building.
        if (!isNaN(parsedNumber)) {
            numericalSequence.push(parsedNumber);
        }
        // No explicit handling for NaN values here as per original behavior
        // which would result in NaN if undefined is added.
    }

    // Initialize an accumulator for the final sum.
    let finalAccumulatedValue = 0;

    // Loop through a predetermined number of elements to calculate their sum.
    // The loop runs exactly `numberOfElementsToProcess` times.
    // If 'numericalSequence' has fewer elements, accessing `numericalSequence[elementIndex]`
    // will yield `undefined`, and adding `undefined` to `finalAccumulatedValue` will
    // cause `finalAccumulatedValue` to become `NaN`, replicating the original script's behavior.
    for (let elementIndex = 0; elementIndex < numberOfElementsToProcess; elementIndex++) {
        const valueToAdd = numericalSequence[elementIndex];
        finalAccumulatedValue += valueToAdd;
    }

    // Output the computed total to the standard console.
    console.log(finalAccumulatedValue);

} catch (processingError) {
    // Basic error handling for file system operations or unexpected issues.
    // In a real application, more detailed error logging might be present.
    console.error("An error occurred during data processing:", processingError.message);
    // Optionally exit with a non-zero code to indicate failure.
    // process.exit(1);
}