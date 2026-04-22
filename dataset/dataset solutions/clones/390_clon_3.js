// This script processes a sequence of integers from standard input.
// For each integer 'moduloValue', it calculates the frequency of differences
// between distinct quadratic residues modulo 'moduloValue'.
// Differences are normalized to be within the range [1, (moduloValue - 1) / 2].
// The output for each modulus is a series of counts, each multiplied by two.

// Utilize the Node.js file system module for input operations.
const fileSystem = require('fs');

/**
 * Safely reads input data from the specified source path.
 * In case of an error, it logs the error and returns an empty string,
 * preventing potential crashes for subsequent processing.
 * @param {string} sourcePath - The path to read data from (e.g., '/dev/stdin').
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
const acquireInputData = (sourcePath) => {
    try {
        return fileSystem.readFileSync(sourcePath, 'utf8');
    } catch (dataReadError) {
        // Log the error for debugging purposes.
        console.error("Failed to read input data:", dataReadError.message);
        // Return an empty string to allow the program to continue without further input-related errors.
        return '';
    }
};

// Read raw input, remove leading/trailing whitespace, split into lines, and convert each line to a number.
let rawInputContent = acquireInputData('/dev/stdin');
let numericInputSequence = rawInputContent.trim().split('\n').map(Number);

/**
 * Normalizes a difference value modulo a given modulus,
 * mapping it to a range of [-maxMagnitude, maxMagnitude].
 * This function is designed to mimic the original code's behavior where
 * differences might be negative after normalization, and only positive indices
 * were effectively counted by the `forEach` loop.
 * @param {number} differenceValue - The raw difference between two numbers.
 * @param {number} modulus - The modulus (n) for the operation.
 * @param {number} maxMagnitude - The ceiling for the magnitude of the difference, typically (n-1)/2.
 * @returns {number} The normalized difference value, potentially negative.
 */
const getNormalizedDifferenceKey = (differenceValue, modulus, maxMagnitude) => {
    let currentResult = differenceValue;

    // First, ensure the difference is non-negative modulo 'modulus'.
    // Example: -1 becomes 6 for modulus 7.
    if (currentResult < 0) {
        currentResult += modulus;
    }

    // Now, if the difference is greater than 'maxMagnitude', subtract 'modulus' to
    // map it to its negative counterpart in the symmetric range.
    // Example: For modulus 7, maxMagnitude 3. If currentResult is 4, it becomes 4-7 = -3.
    // If currentResult is 5, it becomes 5-7 = -2. If currentResult is 6, it becomes 6-7 = -1.
    if (currentResult > maxMagnitude) {
        currentResult -= modulus;
    }

    return currentResult;
};

// Use a pointer to iterate through the input sequence instead of `shift()` for a structural change.
let sequenceIndex = 0;
while (sequenceIndex < numericInputSequence.length) {
    let currentModulus = numericInputSequence[sequenceIndex++]; // Fetch modulus and advance index

    // Termination condition: a modulus value of 0 signals the end of input.
    if (currentModulus === 0) {
        break;
    }

    // Special handling for modulus 1: print an empty line and proceed.
    if (currentModulus === 1) {
        console.log('');
        continue;
    }

    // Guard clause: Ensure modulus is a positive integer greater than 1.
    if (currentModulus < 2 || !Number.isInteger(currentModulus)) {
        console.error(`Encountered an invalid modulus value (${currentModulus}). Skipping this case.`);
        continue;
    }

    // Step 1: Determine quadratic residues modulo 'currentModulus'.
    // Initialize a boolean array; `false` by default means not a residue.
    const isQuadraticResidueFlag = new Array(currentModulus).fill(false);
    // Explicitly set 0 as a quadratic residue (0*0 % n = 0).
    // The original loop starting from 1 might miss this if no other square maps to 0.
    isQuadraticResidueFlag[0] = true;

    // Iterate from 1 up to 'currentModulus - 1' to find other residues.
    for (let currentIterator = 1; currentIterator < currentModulus; currentIterator++) {
        const calculatedResidue = (currentIterator * currentIterator) % currentModulus;
        isQuadraticResidueFlag[calculatedResidue] = true;
    }

    // Step 2: Collect all identified quadratic residues into a list.
    const positiveResiduesList = [];
    isQuadraticResidueFlag.forEach((isResidue, residueValue) => {
        if (isResidue) {
            positiveResiduesList.push(residueValue);
        }
    });

    // Guard clause: If for some reason no residues were found (highly unlikely for n > 1 with 0 included).
    if (positiveResiduesList.length === 0) {
        console.log("No quadratic residues identified for this modulus. Skipping.");
        continue;
    }

    // Step 3: Calculate the frequency of differences between pairs of residues.
    // The maximum magnitude for differences to be considered is floor((n-1)/2).
    const maxDifferenceMagnitude = Math.floor((currentModulus - 1) / 2);

    // Initialize an array to store frequency counts for differences from 1 to maxDifferenceMagnitude.
    // The array size is `maxDifferenceMagnitude + 1` to accommodate index 0 (which will be discarded).
    const differenceFrequencyHistogram = new Array(maxDifferenceMagnitude + 1).fill(0);

    // Iterate through all unique pairs of residues (outerIdx < innerIdx) to calculate differences.
    for (let outerResidueIndex = 0; outerResidueIndex < positiveResiduesList.length; outerResidueIndex++) {
        for (let innerResidueIndex = outerResidueIndex + 1; innerResidueIndex < positiveResiduesList.length; innerResidueIndex++) {
            // Calculate two differences for each pair: (res_outer - res_inner) and (res_inner - res_outer).
            // Apply the normalization logic using the helper function.
            // The original code only effectively counted positive indices after normalization,
            // as `forEach` ignores non-numeric properties (like negative indices).

            // First difference calculation: positiveResiduesList[outerResidueIndex] - positiveResiduesList[innerResidueIndex]
            let normalizedDiffA = getNormalizedDifferenceKey(
                positiveResiduesList[outerResidueIndex] - positiveResiduesList[innerResidueIndex],
                currentModulus,
                maxDifferenceMagnitude
            );
            // Only increment if the normalized difference is a valid positive index.
            if (normalizedDiffA > 0 && normalizedDiffA <= maxDifferenceMagnitude) {
                differenceFrequencyHistogram[normalizedDiffA]++;
            }

            // Second difference calculation: positiveResiduesList[innerResidueIndex] - positiveResiduesList[outerResidueIndex]
            let normalizedDiffB = getNormalizedDifferenceKey(
                positiveResiduesList[innerResidueIndex] - positiveResiduesList[outerResidueIndex],
                currentModulus,
                maxDifferenceMagnitude
            );
            // Only increment if the normalized difference is a valid positive index.
            if (normalizedDiffB > 0 && normalizedDiffB <= maxDifferenceMagnitude) {
                differenceFrequencyHistogram[normalizedDiffB]++;
            }
        }
    }

    // Step 4: Output the calculated frequencies.
    // The original code discards the count for difference 0 (index 0) and then
    // prints each remaining count multiplied by two.
    // This implies that `differenceFrequencyHistogram[k]` stores the count of `k`
    // (where `k` is a positive difference magnitude) from all relevant `m_i - m_j` mappings.
    // Since each unique pair `(a,b)` where `a != b` contributes exactly one positive
    // normalized difference `k` to the histogram (e.g., `a-b` maps to `k`, `b-a` maps to `-k` which is ignored),
    // multiplying by 2 at the end correctly reflects the sum of `count(k)` and `count(-k)` if both were tracked.

    // Create a new array by slicing, excluding the first element (index 0).
    const finalDisplayCounts = differenceFrequencyHistogram.slice(1);

    // Iterate through the final counts and print each value multiplied by two.
    for (const countToDisplay of finalDisplayCounts) {
        console.log(countToDisplay * 2);
    }
}