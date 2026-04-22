// Expert-generated Type III code clone for string rotation analysis.

/**
 * Determines if a target string is a cyclic rotation of a primary string.
 * This function handles input validation and performs the core comparison logic.
 *
 * @param {string[]} incomingTextualData - An array containing two strings:
 *   the primary string at index 0 and the target string at index 1.
 */
function analyzeStringRotation(incomingTextualData) {
    // Initialize a boolean flag to track if a rotation match is found.
    // It defaults to false, assuming no match until proven otherwise.
    let rotationFoundStatus = false;

    // Extract the strings from the input array using descriptive variable names.
    const baseString = incomingTextualData[0];
    const comparisonCandidate = incomingTextualData[1];

    // --- Type III: Add robust input validation and guard clauses ---
    // Verify that both extracted elements are indeed strings.
    // If not, log an error and terminate execution gracefully.
    if (typeof baseString !== 'string' || typeof comparisonCandidate !== 'string') {
        console.error("Input Error: Expected two string values for comparison.");
        return; // Exit the function early due to invalid input.
    }

    // Cache string lengths for efficiency and readability.
    const baseLength = baseString.length;
    const candidateLength = comparisonCandidate.length;

    // --- Type III: Refactor conditional logic for length checks ---
    // A fundamental requirement for cyclic rotation is identical string lengths.
    if (baseLength !== candidateLength) {
        // If lengths differ, a rotation is impossible. `rotationFoundStatus` remains `false`.
        // No explicit assignment needed here as it's already `false`.
    } else if (baseLength === 0) {
        // --- Type III: Introduce specific handling for empty strings ---
        // If both strings are empty, they are considered rotations of each other.
        rotationFoundStatus = true;
    } else {
        // --- Type III: Completely rewrite the core algorithm for rotation detection ---
        // Instead of nested loops, use the common and more concise approach:
        // Concatenate the base string with itself. If the comparison candidate
        // is a substring of this doubled string, then it is a cyclic rotation.
        // Example: baseString = "abc", comparisonCandidate = "bca"
        // doubledBase = "abcabc"
        // "bca" is found within "abcabc", so it's a rotation.

        // Create an extended version of the base string.
        const doubledBase = baseString + baseString;

        // Check for the presence of the comparison candidate within the doubled string.
        if (doubledBase.includes(comparisonCandidate)) {
            rotationFoundStatus = true;
        }
    }

    // --- Type II: Reformat output for consistency with original behavior ---
    // Output "Yes" or "No" based on the final determined status.
    console.log(rotationFoundStatus ? "Yes" : "No");
}

// --- Type II: Rename and reformat the input reading section ---
// Read raw data from standard input, typically a file, as UTF-8.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw content: trim whitespace and split into lines.
// This assumes the input consists of two lines, each being a string.
const preparedStringArray = rawInputContent.trim().split("\n");

// Invoke the main analysis function with the prepared input array.
analyzeStringRotation(preparedStringArray);