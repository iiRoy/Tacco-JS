// This module provides synchronous file system capabilities for Node.js.
const nodeIo = require('fs');

// --- Data Acquisition Phase ---
// Attempt to read all content from standard input synchronously.
// This approach simplifies the multi-step `fstatSync`/`readSync` process into a single call.
let rawStreamContents;
try {
    rawStreamContents = nodeIo.readFileSync(process.stdin.fd, { encoding: 'utf8' });
} catch (dataReadError) {
    // If standard input cannot be accessed or read, log an error and terminate.
    console.error(`ERROR: Unable to retrieve standard input data. Details: ${dataReadError.message}`);
    process.exit(1);
}

// --- Input Validation and Pre-processing Phase ---
// Check if any actual content was provided. An empty or whitespace-only input
// would result in an empty string after trimming.
if (!rawStreamContents || rawStreamContents.trim().length === 0) {
    console.warn("ADVISORY: No meaningful input detected from standard stream. Exiting gracefully.");
    process.exit(0);
}

// Transform the raw string into an array of distinct lines.
// Each line is trimmed to remove leading/trailing whitespace, and any resulting
// empty lines are filtered out to maintain data integrity.
const processedInputLines = rawStreamContents
    .trim()
    .split('\n')
    .map(lineContent => lineContent.trim())
    .filter(trimmedLine => trimmedLine.length > 0); // Discard any lines that become empty after trimming.

// --- Main Program Execution ---
// Invoke the core logic to process the prepared input data.
executeComparisonRoutine();

// --- Core Data Processing Function ---
/**
 * Processes pairs of input lines, performing two types of comparisons:
 * 1. Positional matches: Elements at the same index in both sequences are identical.
 * 2. Value occurrence matches: Total count of how many times any element from the
 *    first sequence appears in the second sequence.
 */
function executeComparisonRoutine() {
    const totalLinesAvailable = processedInputLines.length;

    // A guard clause to handle cases where an odd number of lines is provided.
    // The last line, if unpaired, will not be processed.
    if (totalLinesAvailable % 2 !== 0) {
        console.warn("WARNING: Input contains an odd number of lines. The final line will not be processed as part of a pair.");
    }

    // Iterate through the input lines, taking two at a time for comparison.
    // The loop condition `lineIndex < totalLinesAvailable - 1` ensures that
    // there is always a subsequent line to form a pair.
    for (let lineIndex = 0; lineIndex < totalLinesAvailable - 1; lineIndex += 2) {
        let positionalMatches = 0; // Counter for elements matching at identical positions.
        let valueOccurrenceMatches = 0; // Counter for total occurrences of elements from the first sequence in the second.

        // Split each line into individual string segments based on spaces.
        // Filter out any empty strings that might result from multiple spaces or leading/trailing spaces.
        const primarySequence = processedInputLines[lineIndex]
            .split(' ')
            .filter(part => part.length > 0);
        const secondarySequence = processedInputLines[lineIndex + 1]
            .split(' ')
            .filter(part => part.length > 0);

        // --- Calculate Positional Matches ---
        // Compare elements at the same index up to the length of the shorter sequence.
        const commonLength = Math.min(primarySequence.length, secondarySequence.length);
        for (let elementIdx = 0; elementIdx < commonLength; elementIdx++) {
            // Using strict equality for type-safe comparison.
            if (primarySequence[elementIdx] === secondarySequence[elementIdx]) {
                positionalMatches++;
            }
        }

        // --- Calculate Value Occurrence Matches ---
        // To efficiently count occurrences, first build a frequency map for the secondary sequence.
        // This avoids repeated linear scans within the inner loop, improving performance for larger inputs.
        const secondarySequenceFrequencies = new Map();
        for (const itemOfSecondary of secondarySequence) {
            secondarySequenceFrequencies.set(itemOfSecondary, (secondarySequenceFrequencies.get(itemOfSecondary) || 0) + 1);
        }

        // Now, iterate through the primary sequence and sum up its elements' frequencies
        // as found in the secondary sequence's frequency map.
        for (const itemOfPrimary of primarySequence) {
            if (secondarySequenceFrequencies.has(itemOfPrimary)) {
                valueOccurrenceMatches += secondarySequenceFrequencies.get(itemOfPrimary);
            }
        }

        // --- Output Results ---
        // Display the calculated match counts for the current pair of sequences.
        console.log(`${positionalMatches} ${valueOccurrenceMatches}`);
    }
}