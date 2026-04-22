function ProcessTextSegments(rawInputBuffer) {
    // Define constants for clarity and potential future modifications.
    const ALPHABET_SIZE = 26;
    const ASCII_LOWER_A_OFFSET = 97; // ASCII code for 'a'

    // --- Input Parsing and Validation ---
    // Split the raw input string into individual lines.
    const inputLines = rawInputBuffer.split('\n');

    // Safely convert the first line to determine the sequence length.
    // Using Number() for conversion, a robust alternative to parseInt.
    const sequenceLength = Number(inputLines[0]);

    // Extract the primary character sequence from the second line.
    const targetSequence = inputLines[1];

    // Implement early exit conditions for invalid or empty input scenarios.
    // If the expected length is non-positive or the sequence itself is missing/empty,
    // further analysis is not feasible.
    if (sequenceLength <= 0 || !targetSequence || targetSequence.length === 0) {
        // Output a default value (0) as no overlaps can occur in an invalid sequence.
        // In a production system, more robust error handling or logging might be used.
        console.log(0);
        return; // Terminate execution gracefully.
    }

    // Initialize arrays to store the boundary indices for each character's presence.
    // `firstOccurrenceIndex[char_code]` will hold the starting index (inclusive)
    // `lastOccurrenceIndex[char_code]` will hold the ending index (inclusive)
    // for each letter from 'a' to 'z'.
    const firstOccurrenceIndex = new Array(ALPHABET_SIZE);
    const lastOccurrenceIndex = new Array(ALPHABET_SIZE);

    // --- Determine Character Spans ---
    // Iterate through each character of the lowercase English alphabet.
    for (let charIterator = 0; charIterator < ALPHABET_SIZE; charIterator++) {
        // Construct the character string corresponding to the current alphabet index.
        const currentCharacter = String.fromCharCode(ASCII_LOWER_A_OFFSET + charIterator);

        // Locate the first instance of `currentCharacter` within the `targetSequence`.
        const initialPosition = targetSequence.indexOf(currentCharacter);

        // If `currentCharacter` is not found (indexOf returns -1),
        // assign sentinel values to its span boundaries. These values (`sequenceLength`)
        // ensure that no valid `sequencePointer` will fall within this character's "span".
        if (initialPosition === -1) {
            firstOccurrenceIndex[charIterator] = sequenceLength;
            lastOccurrenceIndex[charIterator] = sequenceLength;
        } else {
            // If the character is found, record its first position.
            firstOccurrenceIndex[charIterator] = initialPosition;
            // Then, find and record its last position.
            lastOccurrenceIndex[charIterator] = targetSequence.lastIndexOf(currentCharacter);
        }
    }

    // --- Calculate Maximum Overlap ---
    let peakOverlapValue = 0; // Variable to store the highest observed overlap count.

    // Traverse each position within the `targetSequence` from start to end.
    // `sequenceCursor` represents the current index being evaluated for character span coverage.
    for (let sequenceCursor = 0; sequenceCursor < sequenceLength; sequenceCursor++) {
        let currentOverlapCount = 0; // Reset count for every new position.

        // For the current `sequenceCursor`, examine every character of the alphabet.
        for (let letterCode = 0; letterCode < ALPHABET_SIZE; letterCode++) {
            // Check if the `sequenceCursor` falls within the defined span of the `letterCode` character.
            // The span is considered from the character's first occurrence (inclusive)
            // up to, but strictly excluding, its last occurrence (exclusive).
            const isWithinSpan =
                sequenceCursor >= firstOccurrenceIndex[letterCode] &&
                sequenceCursor < lastOccurrenceIndex[letterCode];

            if (isWithinSpan) {
                currentOverlapCount++; // Increment if this character's span covers the current position.
            }
        }

        // Update the `peakOverlapValue` if the `currentOverlapCount` is greater.
        if (currentOverlapCount > peakOverlapValue) {
            peakOverlapValue = currentOverlapCount;
        }
    }

    // --- Final Output ---
    // Print the maximum number of distinct character spans observed over any single position.
    console.log(peakOverlapValue);
}

// Invoke the main processing function by reading input from standard input.
// This part of the code typically remains consistent as it handles the external I/O contract.
ProcessTextSegments(require("fs").readFileSync("/dev/stdin", "utf8"));