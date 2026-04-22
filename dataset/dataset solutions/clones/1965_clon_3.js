const fileSystemAccess = require('fs');

/**
 * Safely retrieves raw data from a specified file path, handling potential read errors.
 * This function encapsulates the synchronous file reading operation.
 *
 * @param {string} sourcePath The path to the input file (e.g., '/dev/stdin').
 * @returns {string} The content of the file as a UTF-8 string, or an empty string if an error occurs.
 */
function fetchInputContent(sourcePath) {
    try {
        // Attempt to read the entire file content, assuming UTF-8 encoding.
        const fileDataBuffer = fileSystemAccess.readFileSync(sourcePath, 'utf8');
        return fileDataBuffer;
    } catch (readOperationError) {
        // Log an error if file reading fails, a common scenario for Type III changes.
        console.error(`ERROR: Failed to read from input source '${sourcePath}'. Details: ${readOperationError.message}`);
        // Return an empty string to allow subsequent parsing logic to handle missing data.
        return '';
    }
}

/**
 * This function orchestrates the entire data processing workflow:
 * 1. Reads raw input from stdin.
 * 2. Parses configuration parameters (array size).
 * 3. Initializes a frequency counting structure.
 * 4. Processes data points to update frequencies.
 * 5. Displays the final computed frequencies.
 */
function performFrequencyCalculationAndReport() {
    // Acquire the complete input stream content and split it into individual lines.
    const completeInputLines = fetchInputContent('/dev/stdin').split('\n');

    // Critical validation: Ensure sufficient input lines are available.
    if (completeInputLines.length < 2 || completeInputLines[0].trim() === '' || completeInputLines[1].trim() === '') {
        console.error("ABORT: Insufficient or malformed input data provided. Expecting at least two non-empty lines.");
        // Terminate execution if essential input is missing.
        process.exit(1);
    }

    // Extract and parse the first line to determine the expected array dimension.
    const desiredArrayDimension = parseInt(completeInputLines[0].trim(), 10);

    // Implement robust validation for the array dimension.
    if (isNaN(desiredArrayDimension) || desiredArrayDimension <= 0) {
        console.error(`ABORT: Invalid or non-positive array dimension detected: '${completeInputLines[0]}'. Must be a positive integer.`);
        process.exit(1);
    }

    // Initialize a new array to store the item counts.
    // Instead of using Array.prototype.fill(), we populate it iteratively for a Type III change.
    const itemFrequencyTracker = [];
    for (let currentSlotIndex = 0; currentSlotIndex < desiredArrayDimension; currentSlotIndex++) {
        itemFrequencyTracker.push(0); // Explicitly set each slot to zero.
    }

    // Get the second line, which contains the space-separated data points.
    const dataPointsString = completeInputLines[1];

    // Split the data points string into an array of string tokens.
    // A filter is applied to remove any empty string tokens that might result from extra spaces.
    const individualDataTokens = dataPointsString.split(' ').filter(token => token.trim() !== '');

    // Iterate through each data token to count occurrences.
    for (let tokenPosition = 0; tokenPosition < individualDataTokens.length; tokenPosition++) {
        const currentDataToken = individualDataTokens[tokenPosition];

        // Convert the string token into an integer.
        const numericalValue = parseInt(currentDataToken, 10);

        // Perform comprehensive validation on the parsed numerical value.
        // It must be a valid number and within the expected 1-indexed range [1, desiredArrayDimension].
        if (isNaN(numericalValue) || numericalValue < 1 || numericalValue > desiredArrayDimension) {
            console.warn(`WARNING: Skipping invalid data point '${currentDataToken}' (parsed as ${numericalValue}). It is not a number or falls outside the valid range [1, ${desiredArrayDimension}].`);
            continue; // Skip to the next token if this one is invalid.
        }

        // Convert the 1-indexed numerical value to a 0-indexed array position.
        const arrayTargetIndex = numericalValue - 1;

        // Increment the counter at the calculated position in our frequency tracker.
        itemFrequencyTracker[arrayTargetIndex]++;
    }

    // Output section: Display the final computed frequencies.
    // Added header and footer for visual separation (a new fragment).
    console.log("--- START OF FREQUENCY REPORT ---");
    for (let outputIndex = 0; outputIndex < itemFrequencyTracker.length; outputIndex++) {
        const observedFrequency = itemFrequencyTracker[outputIndex];
        console.log(observedFrequency);
    }
    console.log("--- END OF FREQUENCY REPORT ---");
}

// Initiate the primary execution sequence.
performFrequencyCalculationAndReport();