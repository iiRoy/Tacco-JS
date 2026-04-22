function processInputData(rawDataString) {
    // This function processes raw string input to determine a specific string relationship.

    // Splitting the input into individual lines for further processing.
    // Ensure sufficient lines are available before accessing.
    const inputLines = rawDataString.split('\n');

    // Validate that we have at least two lines of input.
    // If not, we cannot perform the required comparison.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided for comparison.");
        return; // Exit early if input is malformed
    }

    // Extracting the primary and secondary string segments from the input.
    // These will be used for the core logical comparison.
    const firstStringSegment = inputLines[0];
    const secondStringSegment = inputLines[1];

    // Helper function to perform the core comparison logic.
    // It checks if the primary string matches the secondary string after removing its last character.
    const verifyStringSuffix = (mainStr, candidateStrWithSuffix) => {
        // Early exit conditions for invalid comparisons.
        // If the candidate string is empty, it cannot be a longer version of mainStr.
        if (candidateStrWithSuffix.length === 0) {
            return false;
        }

        // If the primary string's length is not exactly one less than the candidate's,
        // they cannot possibly match after suffix removal.
        const expectedMainStrLength = candidateStrWithSuffix.length - 1;
        if (mainStr.length !== expectedMainStrLength) {
            return false;
        }

        // Extract the prefix of the candidate string, excluding its last character.
        // Using substring for variation from the original slice method.
        const candidatePrefix = candidateStrWithSuffix.substring(0, expectedMainStrLength);

        // Perform the final comparison of the primary string with the candidate's prefix.
        return mainStr === candidatePrefix;
    };

    // Determine the final outcome based on the helper function's result.
    // Use a temporary boolean variable for clarity before assigning to the final outcome string.
    let isMatchDetected = verifyStringSuffix(firstStringSegment, secondStringSegment);

    // Convert the boolean result into a "Yes" or "No" string for standardized output.
    const finalComparisonOutcome = isMatchDetected ? "Yes" : "No";

    // Output the computed result to the standard console.
    console.log(finalComparisonOutcome);
}

// --- Application Entry Point & Input Handling ---
// This section handles reading the input from the environment,
// typically from standard input in a competitive programming context.

// Define a constant for the standard input path to avoid magic string literals.
const STANDARD_INPUT_PATH = "/dev/stdin";

// Acquire the file system module.
const fileSystemModule = require("fs");

// Read the raw input data from the specified path using UTF-8 encoding.
// A try-catch block is used here to gracefully handle potential errors during file reading.
try {
    const rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, "utf8");
    // Call the main processing function with the obtained content.
    processInputData(rawInputContent);
} catch (readError) {
    // Log any errors encountered during input reading to standard error.
    console.error(`Failed to read input from ${STANDARD_INPUT_PATH}:`, readError);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}