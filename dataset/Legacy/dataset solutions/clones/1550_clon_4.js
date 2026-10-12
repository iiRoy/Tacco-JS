function Main(rawInput) {
    const [sourceSequence, targetSequence] = rawInput.split('\n');

    const targetLength = targetSequence.length;
    const sourceLength = sourceSequence.length;

    // If the target sequence is longer than the source sequence,
    // no substring of the source can match the target's length.
    // The original code would not enter its main loop and would output its initial minimum value (1001).
    if (sourceLength < targetLength) {
        console.log(1001);
        return;
    }

    // Generate an array of mismatch counts for all possible alignments.
    // Each element in this array represents the Hamming distance
    // between a substring of sourceSequence and the targetSequence.
    const allMismatchCounts = Array.from({ length: sourceLength - targetLength + 1 }, (_, offset) => {
        // For each potential starting 'offset' in the source sequence,
        // calculate the number of differing characters.
        return Array.from({ length: targetLength }, (_, charIndex) => {
            // Compare the character at the current position in the source substring
            // with the character at the corresponding position in the target sequence.
            return sourceSequence.charAt(offset + charIndex) !== targetSequence.charAt(charIndex) ? 1 : 0;
        }).reduce((sumOfDifferences, differenceValue) => sumOfDifferences + differenceValue, 0); // Sum up the differences
    });

    // Find the smallest mismatch count among all calculated distances.
    // Initialize with Infinity to ensure any valid count will be smaller.
    const minimumMismatches = allMismatchCounts.reduce((currentMin, currentCount) => Math.min(currentMin, currentCount), Infinity);

    console.log(minimumMismatches);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
