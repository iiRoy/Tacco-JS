const DataProcessor = (function() {

    // Internal utility function to safely parse string values into numbers
    // and perform basic validation on the count of expected inputs.
    function extractNumericComponents(stringParts, expectedCount = 3) {
        if (!Array.isArray(stringParts) || stringParts.length < expectedCount) {
            // Log an issue if the input array is malformed or too short.
            console.error(`Input array must contain at least ${expectedCount} elements.`);
            return null; // Indicate failure to parse
        }

        const parsedNumbers = [];
        // Iterate only up to the expected count, ignoring extra inputs if any.
        for (let idx = 0; idx < expectedCount; idx++) {
            const currentPart = stringParts[idx];
            const numericValue = Number(currentPart); // Explicit conversion

            if (isNaN(numericValue)) {
                // If any part cannot be converted to a number, return null.
                console.error(`Non-numeric value detected: '${currentPart}' at index ${idx}.`);
                return null;
            }
            parsedNumbers.push(numericValue);
        }
        return parsedNumbers; // Return the array of successfully parsed numbers
    }

    // The primary function exposed by this module to process raw input.
    function analyzeNumericalSequence(sourceData) {
        // Initial validation: ensure the source data is a non-empty string.
        if (typeof sourceData !== 'string' || sourceData.trim().length === 0) {
            console.warn("Received empty or invalid source data for analysis.");
            return "ERROR_NO_DATA"; // Return a specific error string
        }

        // Clean and split the input string by any sequence of whitespace characters.
        // This is more robust than just splitting by a single space.
        const components = sourceData.trim().split(/\s+/);

        // Attempt to extract and validate the three required numeric components.
        const sequenceElements = extractNumericComponents(components, 3);

        // If extraction or validation failed, return an appropriate message.
        if (sequenceElements === null) {
            return "INPUT_FORMAT_INVALID";
        }

        // Destructure the validated numbers for clearer variable names.
        const [valueOne, valueTwo, valueThree] = sequenceElements;

        // Calculate the difference between consecutive terms.
        // This is a core check for arithmetic progression.
        const differenceA = valueTwo - valueOne;
        const differenceB = valueThree - valueTwo;

        let finalDetermination; // Declare a variable to hold the outcome message.

        // Determine if the sequence forms an arithmetic progression.
        if (differenceA === differenceB) {
            finalDetermination = "YES"; // It is an arithmetic progression.
        } else {
            finalDetermination = "NO";  // It is not.
        }

        return finalDetermination;
    }

    // Public API of the DataProcessor module.
    return {
        processInput: analyzeNumericalSequence
    };

})(); // End of Immediately Invoked Function Expression (IIFE)

// --- Global Execution Context ---
// This block handles reading from standard input and initiating the processing.
try {
    // Dynamically load the 'fs' module for file system operations.
    const fileSystemHandler = require("fs");

    // Read the entire content from /dev/stdin.
    // The result is a Buffer object.
    const rawInputBuffer = fileSystemHandler.readFileSync("/dev/stdin");

    // Convert the Buffer to a UTF-8 string and remove surrounding whitespace.
    const processedInputString = rawInputBuffer.toString("utf8").trim();

    // Delegate the actual analysis to our DataProcessor module.
    const analysisOutcome = DataProcessor.processInput(processedInputString);

    // Output the final result to standard output.
    console.log(analysisOutcome);

} catch (executionIssue) {
    // Catch any exceptions that occur during file reading or initial processing.
    console.error("Runtime error encountered:", executionIssue.message);
    // Provide a distinct error message for the standard output stream.
    console.log("PROGRAM_FAILURE");
}