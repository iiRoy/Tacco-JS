// This module defines a core utility function to scrutinize textual input.
// Its primary purpose is to ascertain the presence of a specific set of critical characters.

function scrutinizeTextualInput(sourceStringData) {
    // --- Data Validation Phase ---
    // First, ensure that the provided argument is indeed a string.
    // Non-string inputs are considered invalid for this particular analysis.
    if (typeof sourceStringData !== 'string' || sourceStringData === null || sourceStringData === undefined) {
        // In a production environment, one might throw a custom error or return a specific error code.
        // For this exercise, we'll output a diagnostic message and indicate a failure.
        console.error("Input processing aborted: Expected a valid string for analysis, but received an unsuitable data type.");
        return false; // Signifies that the required conditions could not be met due to invalid input.
    }

    // --- Configuration of Required Elements ---
    // Define the collection of characters that must all be located within the input string.
    // These are the mandatory components for a successful verification.
    const mandatoryConstituents = ['a', 'b', 'c']; // Our target characters.

    // --- Analytical Processing ---
    // Establish an initial assumption: all mandatory constituents are present.
    // This flag will be set to 'false' if even one constituent is found to be missing.
    let areAllConstituentsPresent = true;

    // Iterate through each item in our list of mandatory constituents.
    // The goal is to confirm the existence of each one within the 'sourceStringData'.
    for (let charIndex = 0; charIndex < mandatoryConstituents.length; charIndex++) {
        const currentMandatoryChar = mandatoryConstituents[charIndex];

        // Utilize the 'includes()' method for a clear and direct check.
        // This is a modern alternative to checking 'indexOf() >= 0'.
        if (!sourceStringData.includes(currentMandatoryChar)) {
            // If the current mandatory character is NOT found, then our initial assumption is invalidated.
            areAllConstituentsPresent = false;
            // Since we only need *all* characters to be present, the absence of even one
            // means we can cease further checks and conclude the analysis.
            break;
        }
    }

    // --- Result Reporting ---
    // Based on the final state of our verification flag, output the appropriate message.
    if (areAllConstituentsPresent) {
        console.log("Analysis Result: All Specified Elements Found");
    } else {
        console.log("Analysis Result: Missing One Or More Specified Elements");
    }

    // The function concludes by returning a boolean value,
    // indicating whether all designated characters were successfully located.
    return areAllConstituentsPresent;
}

// --- Standard Input Handling (Boilerplate) ---
// The section below is typically used in competitive programming contexts
// to read input from standard input and pass it to the primary processing function.
// It should generally not be modified for submission unless specifically required.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
scrutinizeTextualInput(rawInputData); // Invoke the main analysis function with the fetched data.