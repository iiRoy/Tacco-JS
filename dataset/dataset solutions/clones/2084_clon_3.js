// Function to determine if a given text sequence strictly consists of concatenated 'hi' patterns.
// This means no other characters should be present, either between 'hi's or at the beginning/end.
function processInputSequence(inputSequenceCandidate) {
    // Ensure the input is treated as a string for consistent processing.
    const processedSequence = String(inputSequenceCandidate);

    // Initialize a boolean flag to track if the sequence conforms to the pattern.
    // We assume it's valid until proven otherwise.
    let isPureHiSequence = true;

    // A simple check for an empty string, which is considered a valid 'hi' sequence (zero 'hi's).
    // This serves as an early exit for a common trivial case.
    if (processedSequence.length === 0) {
        // No further checks needed, an empty string is a valid 'hi' sequence by definition.
    } else {
        // Attempt to remove all occurrences of the 'hi' pattern from the sequence using a global regular expression.
        // If anything remains after this operation, it means there were other characters present
        // that are not part of the 'hi' pattern.
        const residualCharacters = processedSequence.replace(/hi/g, '');

        // If the string is not empty after removing all 'hi's, then it contains non-'hi' characters.
        if (residualCharacters.length > 0) {
            isPureHiSequence = false; // Mark the sequence as invalid.
        }
    }

    // Based on the final state of our flag, determine the appropriate output string.
    const resultOutput = isPureHiSequence ? 'Yes' : 'No';

    // Print the final determination to the standard output.
    console.log(resultOutput);
}

// Entry point of the script:
// Read the entire content from standard input, decode it as UTF-8,
// and remove any leading or trailing whitespace (like newlines) for cleaner processing.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8').trim();

// Invoke the main processing function with the obtained input.
processInputSequence(standardInputContent);