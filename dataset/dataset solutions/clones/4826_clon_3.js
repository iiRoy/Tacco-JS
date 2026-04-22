// Helper function to perform a global string replacement using a regular expression.
// This abstraction aids in maintaining a consistent pattern for all removal operations
// and could be extended for more complex replacement scenarios.
function applyPatternBasedSubstitution(sourceString, targetPattern, replacementValue = '') {
    // Validate input types for robustness.
    if (typeof sourceString !== 'string' || typeof targetPattern !== 'string') {
        console.warn("Warning: Invalid input types for pattern substitution. Expected strings.");
        return sourceString; // Return original string if inputs are not as expected.
    }
    // Create a global regular expression from the target string pattern.
    // The 'g' flag ensures all occurrences are replaced, not just the first.
    const compiledRegex = new RegExp(targetPattern, 'g');
    return sourceString.replace(compiledRegex, replacementValue);
}

// The primary function responsible for evaluating an input text against a set of
// predefined "erasable" patterns to determine if the text can be fully cleared.
function determineTextClearanceStatus(originalTextPayload) {
    // Initial validation of the input data type. Non-string inputs are not processable.
    if (typeof originalTextPayload !== 'string') {
        console.error("Fatal Error: Input payload must be a string for processing.");
        return; // Terminate execution for invalid input.
    }

    // A mutable copy of the input string that will be progressively modified
    // as removal operations are applied.
    let currentProcessingString = originalTextPayload;

    // Define the sequence of specific substrings that are to be removed.
    // The order in this array is critical: longer, overlapping patterns (e.g., 'eraser')
    // must precede their shorter counterparts (e.g., 'erase') to ensure correct logic.
    const orderedRemovalTargets = [
        "eraser",  // Process 'eraser' before 'erase' to prevent partial matches.
        "erase",
        "dreamer", // Process 'dreamer' before 'dream' for similar reasons.
        "dream"
    ];

    // Iterate through each designated removal target in the specified order.
    // For each target, all occurrences within the current string are eliminated.
    for (const targetFragment of orderedRemovalTargets) {
        currentProcessingString = applyPatternBasedSubstitution(currentProcessingString, targetFragment, '');
    }

    // After attempting to remove all specified fragments, check the length of the remaining string.
    // An empty string signifies that all patterns were successfully "erased".
    const isCompletelyEmpty = (currentProcessingString.length === 0);

    // Output the final verdict based on whether the string was entirely cleared.
    if (isCompletelyEmpty) {
        console.log("YES"); // All specified patterns were successfully removed.
    } else {
        console.log("NO");  // Residual text remains, indicating an incomplete erasure.
        // Optional: For diagnostic purposes, one might log the remaining content.
        // console.info(`Debug Info: Remaining unprocessed text: "${currentProcessingString}"`);
    }
}

// Self-executing anonymous function to handle the program's entry point and I/O.
// This structure encapsulates the setup and teardown logic.
(function programEntrypoint() {
    try {
        // Access the Node.js file system module to read input.
        const fileSystemUtility = require("fs");
        // Read the entire content from standard input (/dev/stdin)
        // and decode it as a UTF-8 string. This is common in competitive programming.
        const rawInputDataBuffer = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

        // Invoke the core logic of the application with the acquired input data.
        determineTextClearanceStatus(rawInputDataBuffer);

    } catch (inputReadError) {
        // Catch and report any exceptions that occur during file reading,
        // which could indicate issues with input availability or permissions.
        console.error("An operational error occurred during input acquisition:", inputReadError.message);
    }
})();