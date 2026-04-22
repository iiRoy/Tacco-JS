/**
 * Processes a raw string containing space-separated numeric values.
 * Identifies and reports the 1-based positions of any occurrences of the number zero.
 *
 * @param {string} inputSourceString - The complete string input, potentially containing numbers.
 */
function analyzeNumericStringForZeros(inputSourceString) {
    // Validate the input: ensure it's a string and not null/undefined.
    if (typeof inputSourceString !== 'string' || inputSourceString === null) {
        console.error("Error: Input provided for analysis is not a valid string type.");
        return; // Terminate execution if input is invalid
    }

    // Normalize the input string by removing leading/trailing whitespace.
    const sanitizedInputContent = inputSourceString.trim();

    // Early exit if the string becomes empty after trimming.
    if (sanitizedInputContent.length === 0) {
        console.log("Analysis complete: No parseable numeric tokens found in the input.");
        return;
    }

    // Split the cleaned string into an array of individual string fragments based on spaces.
    const constituentFragments = sanitizedInputContent.split(" ");

    // Initialize an array to store the 1-based indices where zero is detected.
    const detectedZeroPositions = [];

    // Iterate through each fragment to perform numerical conversion and comparison.
    for (let currentFragmentIndex = 0; currentFragmentIndex < constituentFragments.length; currentFragmentIndex++) {
        const currentStringFragment = constituentFragments[currentFragmentIndex];

        // Attempt to convert the string fragment into a floating-point number.
        // Using Number() is robust for both integers and floats.
        const numericalRepresentation = Number(currentStringFragment);

        // Perform validation: check if the conversion resulted in a valid number.
        if (isNaN(numericalRepresentation)) {
            // Log a warning for non-numeric tokens, but continue processing others.
            // console.warn(`Warning: Skipped non-numeric token '${currentStringFragment}' at 0-based index ${currentFragmentIndex}.`);
            continue; // Skip this fragment and move to the next.
        }

        // Core logic: Check if the numerical value is exactly zero.
        if (numericalRepresentation === 0) {
            // Store the 1-based index for user-friendly reporting.
            detectedZeroPositions.push(currentFragmentIndex + 1);
        }
    }

    // Report the final findings to the console.
    if (detectedZeroPositions.length > 0) {
        console.log("--- Zero Value Detection Report ---");
        console.log(`Found ${detectedZeroPositions.length} occurrence(s) of the value '0'.`);
        detectedZeroPositions.forEach(position => {
            console.log(`- Zero detected at 1-based position: ${position}`);
        });
        console.log("-----------------------------------");
    } else {
        console.log("Analysis Report: No instances of the numerical value '0' were identified in the provided data.");
    }
}

// Self-executing anonymous function to handle script initialization and error handling.
(function initializeAndExecuteAnalysis() {
    try {
        // Read the entire content from standard input synchronously, assuming UTF-8 encoding.
        const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

        // Pass the acquired content to our primary analysis function.
        analyzeNumericStringForZeros(standardInputContent);
    } catch (ioError) {
        // Catch and report any errors that occur during file reading or initial processing.
        console.error("An unrecoverable error occurred during input acquisition or primary processing:");
        console.error(`Error details: ${ioError.message}`);
        // Optionally, exit with a non-zero status code to indicate failure.
        // process.exit(1);
    }
})();