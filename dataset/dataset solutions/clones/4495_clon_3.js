process.stdin.setEncoding('utf8'); // Configure the standard input stream to interpret data as UTF-8.

/**
 * Event handler for the 'readable' event on the standard input stream.
 * This function processes incoming data chunks as they become available.
 */
process.stdin.on('readable', function handleInputStreamData() {
    // Attempt to read a chunk of data from the standard input.
    // A 'null' value indicates no more data is currently available.
    const rawDataBuffer = process.stdin.read();

    // Proceed only if valid data was received.
    if (rawDataBuffer !== null) {
        // Convert the raw buffer to a string and then split it into an array of lines.
        // We use toString() explicitly for clarity, though it's often implicit.
        let incomingTextLines = rawDataBuffer.toString().split('\n');

        // Refinement: Filter out any completely empty lines, especially a trailing one
        // that might result from pressing Enter. This ensures we only process meaningful input.
        incomingTextLines = incomingTextLines.filter(lineEntry => lineEntry.trim() !== '');

        // Guard clause: If, after filtering, no valid lines remain or the first line is empty,
        // there's nothing to process in this iteration.
        if (incomingTextLines.length === 0 || incomingTextLines[0].trim() === '') {
            return; // Exit the handler early.
        }

        // Extract the very first line of input, split it by spaces, and take the first segment.
        // The filter(Boolean) removes any empty strings that might result from multiple spaces.
        const initialStringSegments = incomingTextLines[0].split(' ').filter(Boolean);

        // Guard clause: Ensure we actually have a primary string segment to work with.
        if (initialStringSegments.length === 0) {
            return; // No valid string segment found, exit.
        }

        // The primary string provided as input for the core logic.
        const coreInputStringCandidate = initialStringSegments[0];

        // Based on problem specifics, the last character of the input string is removed
        // before being passed to the main processing function.
        // We use substring for this operation.
        const effectiveStringForAnalysis = coreInputStringCandidate.substring(0, coreInputStringCandidate.length - 1);

        // Output the result of our pattern evaluation function to the console.
        console.log(determineLongestReplicatingPrefix(effectiveStringForAnalysis));
    }
});

/**
 * Recursively identifies the length of the longest prefix of a given string
 * that can be perfectly bisected into two identical halves.
 *
 * If the input string cannot be symmetrically divided, it is progressively
 * shortened (by one or two characters from the end) until a symmetric prefix
 * is discovered or the string becomes empty.
 *
 * @param {string} sequenceToExamine The string slice to be analyzed for a symmetric prefix.
 * @returns {number} The length of the longest symmetric prefix found, or 0 if no such prefix exists.
 */
const determineLongestReplicatingPrefix = (sequenceToExamine) => {
    // Input validation: Ensure the parameter is indeed a string.
    if (typeof sequenceToExamine !== 'string') {
        return 0; // Return 0 for invalid input types.
    }

    const currentSequenceLength = sequenceToExamine.length;

    // Base case: If the string is empty, its longest replicating prefix length is 0.
    // This is also the termination point for recursive calls that reduce the string to nothing.
    if (currentSequenceLength === 0) {
        return 0;
    }

    // Check if the current string's length is an even number.
    if (currentSequenceLength % 2 === 0) {
        // For even-length strings, calculate the midpoint.
        const midpointIndexOffset = currentSequenceLength / 2;
        let foundSymmetry = true; // Assume symmetry until a mismatch is found.

        // Iterate through the first half of the string and compare each character
        // with its corresponding character in the second half.
        for (let charIndex = 0; charIndex < midpointIndexOffset; charIndex++) {
            // Using charAt() for explicit character access, which can be slightly safer
            // than bracket notation for non-BMP characters, though not critical here.
            if (sequenceToExamine.charAt(charIndex) !== sequenceToExamine.charAt(charIndex + midpointIndexOffset)) {
                foundSymmetry = false; // Mismatch detected.
                break; // No need to check further, symmetry is broken.
            }
        }

        // If the entire first half matched the second half, this string is symmetric.
        if (foundSymmetry) {
            return currentSequenceLength; // Return its length as the result.
        } else {
            // If not symmetric, and it's an even length, we must remove two characters
            // to potentially arrive at another even-length string that could be symmetric.
            const reducedByTwoChars = sequenceToExamine.slice(0, currentSequenceLength - 2);
            return determineLongestReplicatingPrefix(reducedByTwoChars); // Recurse with the shorter string.
        }
    } else {
        // If the string's length is odd, it cannot be perfectly split into two equal halves.
        // Therefore, we must shorten it by one character from the end to make its length even,
        // and then re-evaluate.
        const reducedByOneChar = sequenceToExamine.slice(0, currentSequenceLength - 1);
        return determineLongestReplicatingPrefix(reducedByOneChar); // Recurse with the now even-length (or empty) string.
    }
};