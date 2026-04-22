function processInputPayload(dataPayload) {
    // Validate that the incoming data payload is not empty or just whitespace.
    if (!dataPayload || dataPayload.trim().length === 0) {
        console.error('Error: Input payload is missing or empty.');
        return;
    }

    // Split the entire input string by newline characters.
    // We are primarily interested in the first line for this operation.
    const contentLines = dataPayload.split('\n');

    // Extract the primary data line, which is expected to contain space-separated numbers.
    const primaryDataLine = contentLines[0];

    // Perform an additional check for the presence of the primary data line.
    if (!primaryDataLine || primaryDataLine.trim().length === 0) {
        console.error('Error: No primary data line found in the input.');
        return;
    }

    // Split the primary data line into individual string segments based on spaces.
    const valueSegments = primaryDataLine.split(' ');

    // Parse the relevant segments into numerical operands.
    // Use Number() for explicit type conversion and provide a default of '0' for robustness
    // in case a segment is missing or malformed, although Number('') results in 0.
    const initialNumericalValue = Number(valueSegments[0] || '0');
    const subtrahendNumericalValue = Number(valueSegments[1] || '0');
    const minuendNumericalValue = Number(valueSegments[2] || '0');
    // The fourth value (original 'd') is not used in the calculation, so its extraction is omitted.

    // Validate that all required operands were successfully parsed as numbers.
    // If any conversion resulted in NaN, it indicates invalid input.
    if (isNaN(initialNumericalValue) || isNaN(subtrahendNumericalValue) || isNaN(minuendNumericalValue)) {
        console.error('Error: One or more input values could not be parsed as valid numbers.');
        return;
    }

    // Calculate an intermediate difference between the second and third operands.
    const intermediateSubtractionResult = subtrahendNumericalValue - minuendNumericalValue;

    let finalComputedOutcome;

    // Apply the core conditional logic: if the subtrahend is less than the minuend,
    // the final result is 0. Otherwise, proceed with the full calculation.
    if (subtrahendNumericalValue < minuendNumericalValue) {
        finalComputedOutcome = 0;
    } else {
        // Complete the calculation by subtracting the initial numerical value from the intermediate result.
        finalComputedOutcome = intermediateSubtractionResult - initialNumericalValue;
    }

    // Output the final calculated value to the console.
    console.log(finalComputedOutcome);
}

// Define the standard input file path for system execution.
const standardSystemInputPath = "/dev/stdin";

// Load the Node.js File System module.
const fileSystemOperations = require("fs");

// Use a try-catch block to handle potential errors during file reading.
try {
    // Read the raw content from the standard input file, specifying UTF-8 encoding.
    const rawSystemInputContent = fileSystemOperations.readFileSync(standardSystemInputPath, "utf8");

    // Invoke the main processing function with the obtained input.
    processInputPayload(rawSystemInputContent);
} catch (readingError) {
    // Log any errors that occur during the file reading process.
    console.error('An exception occurred while attempting to read the system input:', readingError.message);
}