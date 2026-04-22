// Function responsible for analyzing a given data sequence for a specific pattern.
function analyzeSequence(sourceDataCollection) {
    // Define constant strings for the two possible outcomes of the pattern check.
    const SUCCESS_MESSAGE = "Yes";
    const FAILURE_MESSAGE = "No";

    // Internal utility function to handle the final output to the console.
    // This centralizes logging and makes it easier to change output methods later.
    const publishResult = (isPatternDetected) => {
        if (isPatternDetected) {
            console.log(SUCCESS_MESSAGE);
        } else {
            console.log(FAILURE_MESSAGE);
        }
    };

    // --- Input Validation and Pre-processing ---

    // Ensure that the primary input is provided and is in an expected format (an array).
    // If the collection is not an array or is empty, we cannot proceed with the analysis.
    if (!Array.isArray(sourceDataCollection) || sourceDataCollection.length === 0) {
        // Log an internal warning for debugging, but for the user, it's a 'No' scenario.
        console.error("Warning: Invalid or empty source data collection provided.");
        publishResult(false); // No pattern detected due to invalid input.
        return; // Terminate function execution.
    }

    // Extract the primary string that contains the sequence to be analyzed.
    // It is assumed to be the first element within the sourceDataCollection array.
    // Explicitly convert it to a string to prevent issues with non-string inputs.
    let sequenceUnderExamination = String(sourceDataCollection[0]).trim(); // Trim whitespace.

    // Perform a length check on the extracted sequence string.
    // The pattern requires access to the first and third characters (indices 0 and 2).
    // Therefore, the string must have at least 3 characters.
    if (sequenceUnderExamination.length < 3) {
        // If the sequence is too short, the pattern cannot exist.
        console.error("Warning: Sequence too short to check the required positions.");
        publishResult(false); // No pattern detected.
        return; // Terminate function execution.
    }

    // --- Core Pattern Analysis Logic ---

    // Retrieve the character at the very beginning of the sequence (index 0).
    const characterAtInitialPosition = sequenceUnderExamination.charAt(0);

    // Retrieve the character at the third position within the sequence (index 2).
    const characterAtThirdPosition = sequenceUnderExamination.charAt(2);

    // Compare the two extracted characters using strict equality.
    // This determines if the specific pattern (first char === third char) is present.
    const isPatternMatchConfirmed = (characterAtInitialPosition === characterAtThirdPosition);

    // --- Outputting the Final Determination ---

    // Call the helper function to display the final outcome based on the comparison.
    publishResult(isPatternMatchConfirmed);
}

// --- Application Entry Point ---

// This block handles reading input from the standard input stream and initiating the analysis.
try {
    // Use Node.js's 'fs' module to synchronously read the entire content of stdin.
    // The input is expected to be a single line of text.
    // The 'utf8' encoding ensures proper character interpretation.
    const rawInputFromStandardStream = require("fs").readFileSync("/dev/stdin", "utf8");

    // Pass the raw input content, wrapped in an array, to our analysis function.
    // The analyzeSequence function expects an array as its primary argument.
    analyzeSequence([rawInputFromStandardStream]);
} catch (ioError) {
    // In case of any errors during the input reading process (e.g., file not found, permission issues).
    console.error("An operational error occurred while attempting to read input:", ioError.message);
    // As a fail-safe, output the negative response if input cannot be processed.
    console.log("No");
}