// This script analyzes an input string to determine if it matches a specific pattern
// after undergoing a series of character insertions at predefined positions.

/**
 * Processes an input string by inserting 'A's at designated indices
 * and then checks if the resulting string matches "AKIHABARA".
 *
 * @param {string} inputStringData - The raw string received from input.
 */
function evaluateStringPattern(inputStringData) {
    // Define the character to be potentially inserted and the ultimate target sequence.
    const CHARACTER_TO_INSERT = 'A';
    const DESIRED_FINAL_SEQUENCE = "AKIHABARA";

    // Step 1: Normalize the input string.
    // Replace leading and trailing whitespace using a regular expression,
    // which is an alternative to the standard .trim() method.
    let currentWorkingSequence = inputStringData.replace(/(^\s*)|(\s*$)/g, '');

    // Step 2: Define the critical positions for 'A' character verification/insertion.
    // These indices are relative to the string as it exists at the moment of evaluation.
    const criticalInsertionPoints = [0, 4, 6, 8];

    // Step 3: Convert the string into a mutable array of characters for efficient insertions.
    let characterArray = Array.from(currentWorkingSequence);

    // Step 4: Iterate through each critical position and perform conditional insertions.
    // Using forEach for a different loop structure compared to the original 'for' loop.
    criticalInsertionPoints.forEach(function(currentPositionIndex) {
        // Guard clause: Ensure the insertion point is valid within the array's current bounds.
        // This prevents attempting to access or modify non-existent indices in a problematic way.
        if (currentPositionIndex < 0 || currentPositionIndex > characterArray.length) {
            // For this specific problem, these points are expected to be valid.
            // If an invalid index is encountered, it indicates an issue with the
            // `criticalInsertionPoints` definition or an unexpected state.
            // We could throw an error or simply skip, for this clone, we'll ensure robustness.
            return; // Skip processing this point if out of bounds.
        }

        // Retrieve the character currently at the designated position.
        const existingChar = characterArray[currentPositionIndex];

        // Conditional insertion logic:
        // If the character at `currentPositionIndex` is NOT the `CHARACTER_TO_INSERT`,
        // then insert the `CHARACTER_TO_INSERT` at that very position.
        // This will shift all subsequent characters to the right, increasing the string's length.
        if (existingChar !== CHARACTER_TO_INSERT) {
            // The `splice` method is used here to insert an element into the array
            // without removing any existing elements (by setting deleteCount to 0).
            characterArray.splice(currentPositionIndex, 0, CHARACTER_TO_INSERT);
        }
    });

    // Step 5: Reconstruct the modified string from the character array.
    const finalResultingString = characterArray.join('');

    // Step 6: Compare the final modified string with the desired target sequence.
    // An explicit if-else block is used instead of a ternary operator for clarity.
    if (finalResultingString === DESIRED_FINAL_SEQUENCE) {
        console.log("YES");
    } else {
        console.log("NO");
    }
}

// Main execution block: Handles reading input and invoking the primary processing function.
// This section includes enhanced error handling for file operations.
try {
    // Attempt to read the entire content of standard input.
    // The 'utf8' encoding ensures proper character handling.
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Call the core function with the retrieved input data.
    evaluateStringPattern(rawInputContent);

} catch (inputError) {
    // If any error occurs during file reading (e.g., file not found, permissions),
    // or during initial processing, log the error details.
    console.error("An issue was encountered while processing input:", inputError.message);
    // In case of an unhandled error, it's safer to output "NO" as a default failure state.
    console.log("NO");
}