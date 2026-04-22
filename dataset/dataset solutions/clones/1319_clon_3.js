// Define a utility function for consistent output messages.
// This is a Type III addition (new fragment/helper) to abstract `console.log`.
function emitOutcome(messageIdentifier) {
    // Type II: Renamed internal variable, reformat for clarity.
    const finalDisplayString = messageIdentifier;
    // Standard output operation.
    console.log(finalDisplayString);
}

/**
 * Orchestrates the check for string rotational equivalence.
 * This function determines if one string is a cyclic shift of another.
 *
 * @param {string} rawSourceContent The raw input string, expected to contain at least two lines.
 * @returns {void} Outputs a specific message ("RotationConfirmed", "NoRotationFound", etc.) to the console.
 */
function verifyCyclicShift(rawSourceContent) {
    // Type II: Renaming, comments for documentation.
    // Type III: Add guard clause for invalid input type or empty string.
    if (typeof rawSourceContent !== 'string' || rawSourceContent.length === 0) {
        console.error("Invalid or empty string input provided for cyclic shift verification.");
        return; // Early exit on bad input.
    }

    // Type II: Renamed variable from 'lines' to 'contentSegments', reformat whitespace.
    // Type III: Added `.trim()` to handle potential leading/trailing newlines or whitespace
    //           that might affect the split or string comparisons.
    const contentSegments = rawSourceContent.trim().split('\n');

    // Type III: Guard clause - ensure we have at least two lines to perform the check.
    if (contentSegments.length < 2) {
        // Type II: Changed output message for more specificity.
        emitOutcome("InsufficientLines");
        return; // Early exit if not enough data.
    }

    // Type II: Renamed 'lines[0]' to 'firstCandidateString' and 'lines[1]' to 'secondCandidateString' for clarity.
    const firstCandidateString = contentSegments[0];
    const secondCandidateString = contentSegments[1];

    // Type III: Add crucial validation for string lengths.
    // A string 'B' can only be a rotation of 'A' if they have the exact same length.
    if (firstCandidateString.length !== secondCandidateString.length) {
        // Type II: Changed output message for more specificity.
        emitOutcome("LengthMismatch");
        return; // Early exit if lengths don't match.
    }

    // Type III: Handle the edge case of empty strings.
    // If both strings are empty (their lengths are equal and zero), they are considered rotations.
    if (firstCandidateString.length === 0) {
        // Type II: Changed output message.
        emitOutcome("EmptyStringsAreCyclic");
        return; // Early exit for this specific case.
    }

    // Type II: Renamed variable from 'str', reformat for readability.
    // Type III: Explicitly declare a boolean flag to store the result of the check.
    //           This helps to remove the direct `else` block later.
    let isCurrentlyIdentifiedAsRotation = false;

    // The core logic: concatenate the first string with itself (e.g., "AB" -> "ABAB").
    // Type II: Renamed variable for descriptive clarity.
    const extendedPrimarySequence = firstCandidateString + firstCandidateString;

    // Type III: Using the modern `includes()` method instead of `indexOf() !== -1`.
    // This part checks if the second string exists anywhere within the doubled first string.
    if (extendedPrimarySequence.includes(secondCandidateString)) {
        isCurrentlyIdentifiedAsRotation = true;
    }
    // Type III: The `else` block is effectively deleted by initializing `isCurrentlyIdentifiedAsRotation` to `false`
    //           and only setting it to `true` if the condition is met.

    // Type III: Use the helper function for output based on the boolean flag.
    if (isCurrentlyIdentifiedAsRotation) {
        emitOutcome("RotationConfirmed");
    } else {
        emitOutcome("NoRotationFound");
    }
}

// Type II: Renamed the main entry point function.
// Type III: Added a wrapper function for the execution context.
// This abstracts the file reading and error handling from the core logic,
// making the `verifyCyclicShift` function more pure and testable.
function executeCyclicShiftAnalysis() {
    // Type III: Introduce a try-catch block for robust file system operations,
    //           handling potential errors during input reading.
    try {
        // Type II: Renamed the 'fs' module to 'fileSystemUtil', declared as const.
        const fileSystemUtil = require("fs");
        // Type II: Reformat path string, use `const` for immutability.
        //          Read the entire file content.
        const receivedDataBuffer = fileSystemUtil.readFileSync("/dev/stdin", "utf-8");
        
        // Type II: Call the renamed core logic function with the read content.
        verifyCyclicShift(receivedDataBuffer);
    } catch (ioError) {
        // Type II: Renamed error variable from a generic name.
        // Type III: Provide a detailed error message for file reading failure.
        console.error("Execution halted due to input/output error:", ioError.message);
        // Optionally, emit a specific outcome for the user to indicate failure.
        emitOutcome("InputFileReadError");
    }
}

// Type III: Initiate the analysis by calling the wrapper function.
executeCyclicShiftAnalysis();