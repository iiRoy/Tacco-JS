// Module for file system operations, required for standard input handling.
const fileSystemModule = require('fs');

/**
 * Reads and processes data from standard input.
 * It synchronously retrieves all available data, converts it to a UTF-8 string,
 * trims whitespace, and splits the content into an array of lines.
 *
 * @returns {string[]} An array of strings, where each string represents a line
 *                     from standard input after trimming. Returns an empty array
 *                     if no input data is available.
 */
function acquireStandardInputLines() {
    const stdinFileDescriptor = process.stdin.fd; // Obtain the file descriptor for standard input.
    let inputStats;
    try {
        inputStats = fileSystemModule.fstatSync(stdinFileDescriptor);
    } catch (error) {
        console.error("Error accessing standard input file descriptor:", error.message);
        return [];
    }

    // Determine the total size of the input data in bytes.
    let totalInputByteSize = inputStats.size;

    // Guard clause: If no data is present, log a warning and return an empty array.
    if (totalInputByteSize === 0) {
        console.warn("Notice: No data detected in standard input stream. Proceeding with empty dataset.");
        return [];
    }

    // Allocate a new Buffer object of the exact size required for the input data.
    const inputDataBuffer = Buffer.alloc(totalInputByteSize);

    // Synchronously read the entire content from stdin into the allocated buffer.
    // Parameters: fd, buffer, offset (into buffer), length (to read), position (in file).
    const actualBytesRead = fileSystemModule.readSync(
        stdinFileDescriptor,
        inputDataBuffer,
        0,                 // Start writing at the beginning of the buffer.
        totalInputByteSize, // Read up to the total determined size.
        0                  // Start reading from the beginning of the stdin stream.
    );

    // Convert the buffer's content to a UTF-8 string, considering only the bytes actually read.
    const rawContentString = inputDataBuffer.toString('utf8', 0, actualBytesRead);

    // Trim leading/trailing whitespace from the entire content and then split it into individual lines.
    // Each line is an element in the resulting array.
    const processedLinesArray = rawContentString.trim().split('\n');

    return processedLinesArray;
}

/**
 * Core logic function to process pairs of data sequences.
 * It iterates through the global `dataLinesForProcessing` array, taking two lines at a time.
 * For each pair, it calculates "exact matches" (elements identical at the same position)
 * and "misplaced matches" (elements from the first sequence found in the second sequence
 * at a later index, following a specific rule).
 */
function executePrimaryLogic() {
    // Determine the total count of lines available for processing.
    const totalLinesAvailable = dataLinesForProcessing.length;
    let currentLinePairStartIndex = 0; // Index for the first line of the current pair.

    // Loop through the input lines, incrementing by two to process pairs.
    // The loop continues as long as there's at least one full pair left to process.
    while (currentLinePairStartIndex < totalLinesAvailable - 1) {
        // Initialize counters for the current pair's match results.
        let currentExactMatches = 0;    // Corresponds to 'hit' in the original code.
        let currentMisplacedMatches = 0; // Corresponds to 'brow' in the original code.

        // Extract and process the first line of the current pair.
        const firstSequenceRawLine = dataLinesForProcessing[currentLinePairStartIndex];
        // Defensive check for undefined lines, though `while` condition should mostly prevent this.
        if (firstSequenceRawLine === undefined) {
             console.error(`Warning: Undefined line encountered at index ${currentLinePairStartIndex}. Skipping pair.`);
             currentLinePairStartIndex += 2;
             continue;
        }
        const firstSequenceElements = firstSequenceRawLine.trim().split(' '); // Renamed from 'a'.

        // Extract and process the second line of the current pair.
        const secondSequenceRawLine = dataLinesForProcessing[currentLinePairStartIndex + 1];
        // Crucial guard: ensure the second line of the pair actually exists.
        if (secondSequenceRawLine === undefined) {
            console.error(`Error: Missing second line for pair starting at index ${currentLinePairStartIndex}. This pair cannot be fully processed.`);
            // Exit loop or handle error for the remaining single line if any.
            break; // Stop processing if a pair is incomplete.
        }
        const secondSequenceElements = secondSequenceRawLine.trim().split(' '); // Renamed from 'b'.

        // Invoke a helper function to perform the actual comparison logic for the two sequences.
        const { calculatedExacts, calculatedMisplaced } = calculateMatchScores(
            firstSequenceElements,
            secondSequenceElements
        );

        currentExactMatches = calculatedExacts;
        currentMisplacedMatches = calculatedMisplaced;

        // Output the results for the current pair, using a slightly modified format.
        console.log(`${currentExactMatches} ${currentMisplacedMatches}`);

        // Move to the next pair of lines.
        currentLinePairStartIndex += 2;
    }

    // Post-processing check: Inform if an odd number of lines was provided, indicating an incomplete last pair.
    if (totalLinesAvailable % 2 !== 0) {
        console.warn(`Note: The input contained an odd number of lines (${totalLinesAvailable}). The very last line was not processed as part of a pair.`);
    }
}

/**
 * Helper function to compute match scores between two sequences of elements.
 * It distinguishes between exact matches (same value at same index)
 * and misplaced matches (value from first sequence found in second sequence
 * at a *later* index, following the original problem's specific 'brow' logic).
 *
 * @param {string[]} primarySequence - The first sequence of elements (e.g., 'a' in original).
 * @param {string[]} secondarySequence - The second sequence of elements (e.g., 'b' in original).
 * @returns {{calculatedExacts: number, calculatedMisplaced: number}} An object containing the counts.
 */
function calculateMatchScores(primarySequence, secondarySequence) {
    let exactCount = 0;
    let misplacedCount = 0;

    // --- Calculation of Exact Matches ---
    // Iterate up to the length of the shorter sequence to prevent out-of-bounds access.
    const comparisonLength = Math.min(primarySequence.length, secondarySequence.length);
    for (let currentPosition = 0; currentPosition < comparisonLength; currentPosition++) {
        // Use strict equality (`===`) for comparison, assuming string values based on `split(' ')`.
        if (primarySequence[currentPosition] === secondarySequence[currentPosition]) {
            exactCount++;
        }
    }

    // --- Calculation of Misplaced Matches (specific 'brow' logic) ---
    // This logic counts how many times an element `primarySequence[j]`
    // matches an element `secondarySequence[k]` where `k` is strictly greater than `j`.
    // The outer loop iterates through elements of the primary sequence.
    for (let primaryElementIndex = 0; primaryElementIndex < primarySequence.length; primaryElementIndex++) {
        const valueFromPrimary = primarySequence[primaryElementIndex];

        // Skip if the element itself is undefined (e.g., from a sparse array, though unlikely with `split`).
        if (valueFromPrimary === undefined) {
            continue;
        }

        // The inner loop iterates through the secondary sequence, starting from an index *after*
        // the current primary element's index. The upper bound for 'k' was `a.length` in the original.
        for (let secondaryElementScanIndex = primaryElementIndex + 1; secondaryElementScanIndex < primarySequence.length; secondaryElementScanIndex++) {
            const valueFromSecondary = secondarySequence[secondaryElementScanIndex];

            // Check if the secondary element exists and if it matches the primary element.
            if (valueFromSecondary !== undefined && valueFromPrimary === valueFromSecondary) {
                misplacedCount++;
            }
        }
    }

    return { calculatedExacts: exactCount, calculatedMisplaced: misplacedCount };
}

// Global variable to store the processed input lines from standard input.
// Renamed from 'input' to 'dataLinesForProcessing'.
let dataLinesForProcessing = acquireStandardInputLines();

// Initiate the primary execution flow after all input data has been acquired and prepared.
executePrimaryLogic();