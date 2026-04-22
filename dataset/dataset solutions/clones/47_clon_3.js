const fileSystemHandler = require('fs'); // Module for file system operations.
const standardInputDescriptor = process.stdin.fd; // File descriptor for standard input.

/**
 * Utility function to safely parse an integer from a string.
 * It handles potential NaN results and provides a default value.
 * @param {string} stringValue - The string to parse.
 * @param {number} [defaultValue=0] - The value to return if parsing fails.
 * @returns {number} The parsed integer or the default value.
 */
const parseNumericValue = (stringValue, defaultValue = 0) => {
    // Attempt to parse the string into an integer with base 10.
    const parsedInteger = Number.parseInt(stringValue, 10);

    // Validate the parsed result. If it's NaN or not a finite number,
    // log a warning and return the specified default value.
    if (Number.isNaN(parsedInteger) || !Number.isFinite(parsedInteger)) {
        console.warn(`Warning: Failed to convert "${stringValue}" into an integer. Using default value ${defaultValue} instead.`);
        return defaultValue;
    }
    return parsedInteger;
};

// --- Input Reading and Initial Processing ---

// Determine the size of the standard input stream.
// Note: fs.fstatSync(process.stdin.fd).size can be 0 for pipes/interactive input
// until data is actually written. For file redirection, it works as expected.
const totalInputByteCount = fileSystemHandler.fstatSync(standardInputDescriptor).size;

// Early exit if no data is detected in the input stream.
if (totalInputByteCount === 0) {
    console.error("Error: No data detected on standard input. Please provide input.");
    process.exit(1); // Terminate the process with an error code.
}

// Allocate a buffer to hold the raw bytes read from standard input.
// Using Uint8Array for raw byte handling, which is a standard JavaScript type.
const rawDataStorage = new Uint8Array(totalInputByteCount);

// Read the entire content from standard input into our buffer.
// The `readSync` method blocks until data is available or EOF is reached.
const actualBytesTransferred = fileSystemHandler.readSync(standardInputDescriptor, rawDataStorage, 0, totalInputByteCount, 0);

// Convert the portion of the raw byte buffer that actually contains data into a UTF-8 string.
// Then, split the string into an array of lines based on newline characters.
const inputLineArray = Buffer.from(rawDataStorage.slice(0, actualBytesTransferred))
                            .toString('utf8')
                            .split('\n');

// --- Main Program Execution ---

// Immediately invoke the core logic function with the parsed input lines.
performCoordinateSystemTransformation(inputLineArray);

/**
 * Executes the primary logic of the program, transforming coordinates based on input.
 * This function handles parsing parameters, initializing data structures,
 * applying transformation rules, and outputting the final state.
 * @param {string[]} linesOfInput - An array of strings, where each string is a line from the input.
 */
function performCoordinateSystemTransformation(linesOfInput) {
    // Basic validation: Ensure there are at least two lines for initial parameters.
    if (linesOfInput.length < 2) {
        console.error("Error: Insufficient input. Expected at least two lines for initial parameters.");
        return; // Exit the function if critical input is missing.
    }

    // Parse the initial system width from the first line of input.
    const systemWidth = parseNumericValue(linesOfInput[0]);
    // Parse the number of transformation operations from the second line.
    const numberOfOperations = parseNumericValue(linesOfInput[1]);

    // Validate the parsed dimensions and operation count.
    if (systemWidth <= 0) {
        console.error(`Error: Invalid system width '${systemWidth}'. Width must be a positive integer.`);
        return;
    }
    if (numberOfOperations < 0) {
        console.error(`Error: Invalid number of operations '${numberOfOperations}'. Must be non-negative.`);
        return;
    }

    // Initialize an array to represent the mapping of positions.
    // Each index initially maps to itself (identity transformation).
    // Using Int8Array for memory efficiency, as values are small integers.
    const positionMapper = new Int8Array(systemWidth);

    // Populate the initial identity mapping.
    // For every index 'k' from 0 to 'systemWidth - 1', set positionMapper[k] = k.
    for (let k = 0; k < systemWidth; ++k) {
        positionMapper[k] = k;
    }

    // --- Process Transformation Operations ---

    // Iterate through the input lines that define the swap operations.
    // Operations start from the third line (index 2) up to `numberOfOperations` times.
    for (let operationCounter = 0; operationCounter < numberOfOperations; ++operationCounter) {
        const currentInputLineIndex = 2 + operationCounter;

        // Retrieve the current line for processing.
        const currentOperationLine = linesOfInput[currentInputLineIndex];

        // Guard clause: Skip if the line is missing or empty, indicating malformed input.
        if (!currentOperationLine || currentOperationLine.trim().length === 0) {
            console.warn(`Warning: Skipping empty or missing operation line at index ${currentInputLineIndex}.`);
            continue;
        }

        // Split the line by comma to get the two coordinates for the swap.
        const coordinateElements = currentOperationLine.split(",");

        // Guard clause: Ensure exactly two coordinate parts are present.
        if (coordinateElements.length !== 2) {
            console.warn(`Warning: Malformed operation line "${currentOperationLine}". Expected two comma-separated values. Skipping.`);
            continue;
        }

        // Parse the 'source' and 'destination' indices, adjusting for 0-based indexing.
        // The problem typically uses 1-based indexing in input, so we subtract 1.
        const sourceMappingIndex = parseNumericValue(coordinateElements[0]) - 1;
        const targetMappingIndex = parseNumericValue(coordinateElements[1]) - 1;

        // Further validation: Check if the parsed indices are within the valid bounds of the system.
        const isSourceIndexValid = sourceMappingIndex >= 0 && sourceMappingIndex < systemWidth;
        const isTargetIndexValid = targetMappingIndex >= 0 && targetMappingIndex < systemWidth;

        if (!isSourceIndexValid || !isTargetIndexValid) {
            console.warn(`Warning: Operation (${sourceMappingIndex + 1}, ${targetMappingIndex + 1}) has out-of-bounds indices for system width ${systemWidth}. Skipping.`);
            continue;
        }

        // Perform the swap operation using a temporary variable.
        // The original code used an XOR swap; this is an equivalent, more readable swap.
        const temporaryValue = positionMapper[sourceMappingIndex];
        positionMapper[sourceMappingIndex] = positionMapper[targetMappingIndex];
        positionMapper[targetMappingIndex] = temporaryValue;
    }

    // --- Output Final Mappings ---

    // Iterate through the final state of the position mapping array.
    // For each element, print its value adjusted back to 1-based indexing.
    for (let outputDisplayIndex = 0; outputDisplayIndex < positionMapper.length; ++outputDisplayIndex) {
        console.log(positionMapper[outputDisplayIndex] + 1);
    }
}