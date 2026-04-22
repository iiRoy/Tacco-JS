const fileSystemModule = require('fs');

// Define key constants to enhance readability and maintainability.
// These represent the target sequence, its length, and its sorted (canonical) form.
const DESIRED_SEQUENCE = "AIZUNYAN";
const SUBSTRING_LENGTH = 8;
const SORTED_DESIRED_SEQUENCE = "AADINNUY"; // 'AIZUNYAN' sorted alphabetically

/**
 * Generates the canonical (sorted character) form of a given string.
 * This utility function is crucial for identifying anagrams.
 * @param {string} originalString - The string to be converted to its canonical form.
 * @returns {string} The string with its characters sorted alphabetically.
 */
const obtainCanonicalForm = (originalString) => {
    // Convert the string into an array of individual characters,
    // sort these characters, and then re-join them into a new string.
    return Array.from(originalString).sort().join('');
};

try {
    // Read the entire content from standard input synchronously.
    // The '/dev/stdin' path is a common convention for competitive programming environments.
    let rawContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Trim any leading or trailing whitespace (like newlines) from the input string.
    // This ensures that processing starts with clean data.
    let currentMutableString = rawContentBuffer.trim();

    // Implement a guard clause: If the string is shorter than the sequence we're looking for,
    // there's nothing to process, so we can just print it and exit early.
    if (currentMutableString.length < SUBSTRING_LENGTH) {
        console.log(currentMutableString);
        process.exit(0); // Indicate successful completion
    }

    // Iterate through the string to find and process relevant substrings.
    // The loop condition ensures that we always have a full 'SUBSTRING_LENGTH' segment to check.
    for (let charIndex = 0; charIndex <= currentMutableString.length - SUBSTRING_LENGTH; charIndex++) {

        // Extract the current segment of the specified length for examination.
        let segmentToCheck = currentMutableString.substring(charIndex, charIndex + SUBSTRING_LENGTH);

        // First, check for an exact match. If the segment is already the desired sequence,
        // we just advance our index past it to avoid redundant checks or replacements.
        if (segmentToCheck === DESIRED_SEQUENCE) {
            // Advance the index by (length - 1) because the for loop's charIndex++ will then
            // move it to the start of the next potential segment.
            charIndex += SUBSTRING_LENGTH - 1;
            continue; // Skip to the next iteration
        }

        // If it's not an exact match, calculate its canonical form to check for anagrams.
        const segmentCanonical = obtainCanonicalForm(segmentToCheck);

        // If the canonical form matches our target's canonical form, it's an anagram.
        // In this case, we replace the anagram with the actual desired sequence.
        if (segmentCanonical === SORTED_DESIRED_SEQUENCE) {
            // Reconstruct the string: part before the segment, the desired sequence, part after.
            currentMutableString = currentMutableString.substring(0, charIndex) +
                                   DESIRED_SEQUENCE +
                                   currentMutableString.substring(charIndex + SUBSTRING_LENGTH);

            // After replacement, advance the index to skip the newly inserted sequence.
            // This prevents re-processing the same spot or overlapping replacements.
            charIndex += SUBSTRING_LENGTH - 1;
        }
        // If neither an exact match nor an anagram, the loop simply increments charIndex
        // and moves to the next potential segment.
    }

    // Output the final, processed string to standard output.
    console.log(currentMutableString);

} catch (operationError) {
    // Provide robust error handling for file system operations or other runtime issues.
    console.error("An unexpected error occurred during string processing:", operationError.message);
    process.exit(1); // Indicate an error occurred
}