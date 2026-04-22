"use strict";

// Required Node.js module for file system operations, specifically reading from standard input.
const fileSystemModule = require("fs");

/**
 * A highly generalized function to construct a string based on a bitmask and a source string.
 * It processes characters from a conceptual segment of the `sourceText` by iterating
 * from a 'right-most' logical position down to 'left-most'. For each character,
 * its placement (prepend or append) is determined by a corresponding bit in the `currentMask`.
 * This method precisely replicates the intricate string generation logic of the original code.
 *
 * @param {string} sourceText The complete string containing both segments (e.g., 's' from original).
 * @param {number} segmentLength The defined length 'n' for each segment.
 * @param {number} currentMask The bitmask ('b' from original) that dictates character placement.
 * @param {function(string, number, number): string} characterResolver A callback function responsible
 *        for extracting the correct character from `sourceText` given the `segmentLength` and
 *        the current `bitIndex` (which is 'i' from the original loop). This allows for
 *        flexible character sourcing from different parts of `sourceText`.
 * @returns {string} The fully constructed and permuted string.
 */
function generatePermutedSequence(sourceText, segmentLength, currentMask, characterResolver) {
    let constructedSequence = ""; // Accumulator for the generated string

    // The loop iterates from 'segmentLength - 1' down to '0'.
    // This 'bitIndex' directly corresponds to the 'i' variable in the original code's inner loops.
    for (let bitIndex = segmentLength - 1; bitIndex >= 0; bitIndex--) {
        // Use the provided character resolver to get the specific character for this iteration.
        const charToPlace = characterResolver(sourceText, segmentLength, bitIndex);

        // Determine if the character should be prepended or appended based on the bitmask.
        // The original code used `b&(1<<i)`, which is equivalent to `(currentMask >> bitIndex) & 1`.
        if ((currentMask >> bitIndex) & 1) {
            // If the bit is 1, prepend the character to the accumulating string.
            constructedSequence = charToPlace + constructedSequence;
        } else {
            // If the bit is 0, append the character to the accumulating string.
            constructedSequence = constructedSequence + charToPlace;
        }
    }
    return constructedSequence;
}

/**
 * Character resolver for the first segment (characters at indices 0 to n-1).
 * It directly maps the 'bitIndex' to the character's position in the `fullInputString`.
 *
 * @param {string} fullInputString The entire input string.
 * @param {number} _unusedSegmentLength Parameter required by signature but not used here.
 * @param {number} charBitIndex The bit position, which doubles as the character's index.
 * @returns {string} The character from the first segment.
 */
function resolveFirstSegmentChar(fullInputString, _unusedSegmentLength, charBitIndex) {
    // For the first segment, the character at index 'i' (charBitIndex) is used directly.
    return fullInputString[charBitIndex];
}

/**
 * Character resolver for the second segment (characters at indices n to 2n-1).
 * It calculates the character's actual index in `fullInputString` using the
 * original code's `2*n + ~i` (which expands to `2*n - (i + 1)`) logic.
 *
 * @param {string} fullInputString The entire input string.
 * @param {number} segLength The length 'n' of a single segment.
 * @param {number} charBitIndex The bit position, used to compute the character's index.
 * @returns {string} The character from the second segment.
 */
function resolveSecondSegmentChar(fullInputString, segLength, charBitIndex) {
    // The original code uses `s[2*n + ~i]`.
    // `~i` is equivalent to `-(i + 1)`.
    // So, the index is `2 * segLength - (charBitIndex + 1)`.
    return fullInputString[2 * segLength - (charBitIndex + 1)];
}


// --- Main Program Execution Flow ---

try {
    // Read all input from standard input (file descriptor 0).
    // Convert the buffer content to a UTF-8 string.
    const rawInputBuffer = fileSystemModule.readFileSync(0);
    const completeInputString = rawInputBuffer.toString();

    // Split the input string by newline characters into an array of lines.
    const inputLineArray = completeInputString.split('\n');

    // --- Input Validation ---
    if (inputLineArray.length < 2) {
        console.error("Error: Incomplete input provided. Expected at least two lines.");
        process.exit(1); // Terminate with an error code
    }

    // Parse the first line to get the segment size 'n'.
    // Using parseInt with radix 10 for explicit base conversion.
    const segmentLength = parseInt(inputLineArray[0], 10);

    // Validate the parsed segment size.
    if (isNaN(segmentLength) || segmentLength <= 0) {
        console.error("Error: Invalid segment length. Must be a positive integer.");
        process.exit(1);
    }

    // The second line contains the primary data string 's'.
    const primaryDataString = inputLineArray[1];

    // Validate the length of the data string.
    // It must be exactly twice the segment length for two full segments.
    if (primaryDataString.length !== 2 * segmentLength) {
        console.error(`Error: Data string length (${primaryDataString.length}) does not match the expected length (2 * ${segmentLength} = ${2 * segmentLength}).`);
        process.exit(1);
    }

    // A Map data structure to store the frequency counts of strings generated
    // from the first segment. Using Map offers better performance and clarity
    // compared to a plain JavaScript object for string keys.
    const firstSegmentPermutationCounts = new Map();

    // Calculate the total number of unique bitmask combinations (2^n).
    // This is equivalent to `Math.pow(2, segmentLength)`.
    const totalPossibleCombinations = 1 << segmentLength;

    // --- First Processing Pass: Generate and Count Strings from the First Segment ---
    // Iterate through every possible bitmask from 0 up to (2^n - 1).
    for (let currentBitmaskValue = 0; currentBitmaskValue < totalPossibleCombinations; currentBitmaskValue++) {
        // Generate a string using characters from the first 'n' part of `primaryDataString`.
        const generatedStringFromFirstSegment = generatePermutedSequence(
            primaryDataString,
            segmentLength,
            currentBitmaskValue,
            resolveFirstSegmentChar // Use the resolver specific to the first segment
        );

        // Increment the count for this specific generated string in the map.
        // If the string is encountered for the first time, its count starts at 1.
        firstSegmentPermutationCounts.set(
            generatedStringFromFirstSegment,
            (firstSegmentPermutationCounts.get(generatedStringFromFirstSegment) || 0) + 1
        );
    }

    // Initialize a variable to accumulate the total count of matching pairs.
    let cumulativeMatchingPairs = 0;

    // --- Second Processing Pass: Generate Strings from the Second Segment and Find Matches ---
    // Again, iterate through every possible bitmask.
    for (let currentBitmaskValue = 0; currentBitmaskValue < totalPossibleCombinations; currentBitmaskValue++) {
        // Generate a string using characters from the second 'n' part of `primaryDataString`.
        // Crucially, a different character resolver is used here to match the original logic.
        const generatedStringFromSecondSegment = generatePermutedSequence(
            primaryDataString,
            segmentLength,
            currentBitmaskValue,
            resolveSecondSegmentChar // Use the resolver specific to the second segment
        );

        // Retrieve the count of this generated string from the map populated in the first pass.
        // If the string does not exist in the map, `get()` returns `undefined`, which defaults to 0.
        const matchesForCurrentString = firstSegmentPermutationCounts.get(generatedStringFromSecondSegment) || 0;

        // Add the retrieved count to the total accumulator.
        cumulativeMatchingPairs += matchesForCurrentString;
    }

    // Output the final computed total number of matching pairs to standard output.
    console.log(cumulativeMatchingPairs);

} catch (error) {
    // Catch any unexpected errors during file reading or processing.
    console.error("An unexpected error occurred:", error.message);
    process.exit(1);
}