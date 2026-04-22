let receivedDataBuffer = '';

// Begin listening for standard input.
process.stdin.resume();
// Set the encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', (inputSegment) => {
    // Append the new segment to our buffer.
    receivedDataBuffer += inputSegment;
});

// Event listener for the end of standard input stream.
process.stdin.on('end', () => {
    // Define a minimum allowed length for a pattern segment to be considered.
    // The original code implies patterns of length 3 or more are processed (loop stops when length is 2).
    const MIN_REPETITION_UNIT_SIZE = 3;

    // Process the accumulated data.
    // Extract the first line and remove its last character (e.g., a newline or specific delimiter).
    // Ensure the buffer is not empty before processing.
    if (!receivedDataBuffer || receivedDataBuffer.trim().length === 0) {
        console.error("Error: No input received or input is empty.");
        return;
    }

    const inputLines = receivedDataBuffer.split('\n');
    let primarySourceSequence = inputLines[0];

    // Remove the trailing character from the first line, if it exists.
    if (primarySourceSequence.length > 0) {
        primarySourceSequence = primarySourceSequence.substring(0, primarySourceSequence.length - 1);
    } else {
        console.error("Error: Primary source sequence became empty after initial processing.");
        return;
    }

    // A list to store the repetition counts for various pattern candidates.
    const repetitionCounts = [];
    // A list to store the actual pattern candidates that produced the counts.
    const patternCandidates = [];

    // Determine the initial candidate pattern by taking the first half of the primary sequence.
    // Using Math.floor to handle odd lengths gracefully.
    // The original code uses `text.slice(0,-Math.floor(text.length/2))` which is equivalent to
    // taking the first `text.length - Math.floor(text.length/2)` characters.
    const initialCandidateLength = primarySourceSequence.length - Math.floor(primarySourceSequence.length / 2);
    let currentPatternUnit = primarySourceSequence.substring(0, initialCandidateLength);

    // Loop to generate and test pattern candidates.
    // The loop continues as long as the current pattern unit is long enough.
    while (currentPatternUnit.length >= MIN_REPETITION_UNIT_SIZE) {
        // Calculate how many times the current pattern unit repeats consecutively from the start.
        const currentRepetitionCount = tallyPrefixRepetitions(primarySourceSequence, currentPatternUnit);

        // Store the results for later analysis.
        repetitionCounts.push(currentRepetitionCount);
        patternCandidates.push(currentPatternUnit);

        // Truncate the current pattern unit by one character from the end for the next iteration.
        // This generates progressively shorter patterns to test.
        currentPatternUnit = currentPatternUnit.substring(0, currentPatternUnit.length - 1);
    }

    // If no patterns were processed (e.g., input was too short to generate valid patterns),
    // handle this edge case gracefully.
    if (repetitionCounts.length === 0) {
        console.error("No valid patterns found to analyze based on the minimum repetition unit size.");
        return;
    }

    // Find the maximum repetition count among all candidates.
    const maxRepetitionValue = Math.max(...repetitionCounts);

    // Find the index of the first occurrence of the maximum repetition value.
    const bestPatternIdx = repetitionCounts.indexOf(maxRepetitionValue);

    // Retrieve the pattern candidate that yielded the maximum repetition.
    const bestRepeatingPattern = patternCandidates[bestPatternIdx];

    // Calculate the final result: length of the best pattern multiplied by its max repetition count.
    const finalCalculatedValue = bestRepeatingPattern.length * maxRepetitionValue;

    // Output the computed result to standard output.
    console.log(finalCalculatedValue);
});

/**
 * Calculates the number of consecutive times a given sub-pattern repeats at the beginning of a source string.
 * This function effectively counts how many times the `subPattern` forms the prefix of `sourceString`.
 *
 * @param {string} sourceString The main string to search within.
 * @param {string} subPattern The pattern to check for repetitions.
 * @returns {number} The count of consecutive repetitions. Returns 0 if the sub-pattern is empty,
 *                   longer than the source string, or not found at the very beginning.
 */
function tallyPrefixRepetitions(sourceString, subPattern) {
    let repetitionCounter = 0;

    // Guard clauses for invalid or trivial inputs to prevent errors and optimize.
    if (!sourceString || !subPattern || subPattern.length === 0) {
        return 0; // Cannot repeat an empty or non-existent pattern/source.
    }
    if (subPattern.length > sourceString.length) {
        return 0; // A pattern longer than the source string cannot repeat within it.
    }

    let currentOffset = 0;
    const patternLength = subPattern.length;

    // Loop while the segment of `sourceString` starting at `currentOffset`
    // and having `patternLength` matches the `subPattern`.
    while (sourceString.substring(currentOffset, currentOffset + patternLength) === subPattern) {
        repetitionCounter++;
        currentOffset += patternLength; // Move the offset to check the next potential repetition.
    }

    return repetitionCounter;
}