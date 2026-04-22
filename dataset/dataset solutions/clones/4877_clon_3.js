// Core utility to determine the number of distinct character value changes within a given string.
function AnalyzeSequenceChanges(sourceData) {
    // A preliminary check to ensure the input is valid and processable.
    // If the input isn't a string or is empty, no analysis can be performed.
    if (typeof sourceData !== 'string' || sourceData.length === 0) {
        console.warn("Input supplied is either non-string or vacant. Terminating analysis.");
        // For an empty sequence, there are no transitions, so the count is zero.
        console.info(0);
        return;
    }

    // Initialize a counter to track every instance where the current character differs from its predecessor.
    let distinctChangeCount = 0;
    // Cache the string's length to optimize loop performance.
    const sequenceLength = sourceData.length;

    // Handle the trivial case of a single-character string explicitly.
    // A string with only one character cannot have any transitions.
    if (sequenceLength === 1) {
        console.info(0);
        return;
    }

    // Establish the initial reference point: the very first character of the sequence.
    let priorSymbol = sourceData[0];

    // Commence iteration from the second character (index 1) to enable comparison with the preceding one.
    for (let currentIdx = 1; currentIdx < sequenceLength; ++currentIdx) {
        // Extract the character at the current position.
        const presentSymbol = sourceData[currentIdx];

        // Compare the current character with the one immediately before it.
        // If they are not identical, a transition has occurred.
        if (priorSymbol !== presentSymbol) {
            // Increment the transition counter.
            distinctChangeCount = distinctChangeCount + 1;
            // Update the 'priorSymbol' to the 'presentSymbol' for the subsequent iteration's comparison.
            priorSymbol = presentSymbol;
        }
        // If the characters are identical, no change is registered, and 'priorSymbol' naturally remains unchanged.
    }

    // Output the final tally of character transitions detected.
    console.info(distinctChangeCount);
}

// --- Primary Execution Pathway ---
// Designate the path for standard input, typically where program input is received.
const stdInputFilePath = "/dev/stdin";

// Implement robust error handling for file operations.
try {
    // Read the entire content of the standard input file, converting it to a UTF-8 string.
    // The .trim() method removes any leading/trailing whitespace, including newlines,
    // which is crucial for accurate character sequence analysis.
    const rawContentBuffer = require("fs").readFileSync(stdInputFilePath, { encoding: "utf8" });
    const processedInputString = rawContentBuffer.trim();

    // Invoke the sequence analysis function with the cleaned input data.
    AnalyzeSequenceChanges(processedInputString);
} catch (operationalError) {
    // Should any error arise during file reading or initial processing,
    // log the error details and provide a default, non-disruptive output.
    console.error("An operational error precluded input processing:", operationalError.message);
    console.info(0); // Indicate zero transitions in case of input failure.
}