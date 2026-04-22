// This script analyzes properties of quadratic residues modulo an integer.
// It reads a sequence of positive integers from standard input, processing each
// until a zero is encountered, which signals termination.
// For each integer 'N' (greater than 1), it determines the "difference counts"
// between its quadratic residues.

// Import the file system module for reading input
const fsModule = require('fs');

/**
 * Normalizes a cyclic difference value.
 * This function ensures the difference is positive modulo `modulusValue`
 * and then maps it to the range `[0, maxHalfLength]` by taking the minimum
 * of the difference and `modulusValue - difference`.
 * This is typical for symmetric differences in cyclic groups.
 *
 * @param {number} initialDiff The raw difference (can be negative).
 * @param {number} modulusValue The modulus N.
 * @param {number} maxHalfLength The maximum symmetric difference length, typically (N-1)/2.
 * @returns {number} The normalized difference.
 */
function normalizeCyclicDifference(initialDiff, modulusValue, maxHalfLength) {
    let adjustedDiff = initialDiff;

    // Step 1: Ensure the difference is within [0, modulusValue - 1]
    if (adjustedDiff < 0) {
        adjustedDiff += modulusValue;
    }

    // Step 2: Map to the symmetric range [0, maxHalfLength]
    // If the difference is greater than maxHalfLength, it's equivalent to
    // (modulusValue - adjustedDiff) in terms of symmetric distance.
    if (adjustedDiff > maxHalfLength) {
        adjustedDiff = modulusValue - adjustedDiff;
    }
    return adjustedDiff;
}

/**
 * Parses a raw input string into an array of integers.
 * It trims whitespace, splits by newlines, filters out empty lines,
 * and converts each non-empty line to an integer.
 *
 * @param {string} inputString The raw string content from input.
 * @returns {number[]} An array of parsed integer values.
 */
function parseInputNumbers(inputString) {
    // Trim global whitespace, split into lines, filter out any empty lines,
    // and then convert each remaining line to an integer using base 10.
    return inputString.trim().split('\n').filter(line => line.length > 0).map(line => parseInt(line, 10));
}

// Main script execution block
try {
    // Read all input from standard input as a UTF-8 encoded string.
    const rawInputContent = fsModule.readFileSync('/dev/stdin', 'utf8');
    // Parse the raw string content into a sequence of numbers.
    const inputNumberSequence = parseInputNumbers(rawInputContent);

    let sequencePointer = 0; // Index to iterate through the inputNumberSequence.
    const allOutputLines = []; // An array to collect all output strings before printing them at once.

    // Loop through the sequence of numbers. The loop continues until
    // a termination signal (a number '0') is encountered in the input.
    while (sequencePointer < inputNumberSequence.length) {
        const currentModulus = inputNumberSequence[sequencePointer++]; // Get the next number and advance pointer.

        // Termination condition: if the current modulus is 0, exit the loop.
        if (currentModulus === 0) {
            break;
        }

        // Special handling for N=1: The problem asks for an empty line output.
        if (currentModulus === 1) {
            allOutputLines.push(''); // Add an empty string to the output collection.
            continue; // Proceed to the next number in the sequence.
        }

        // Input validation: Ensure the modulus is a positive integer greater than 1.
        // If not, skip this modulus and proceed. (Assuming valid inputs per problem context).
        if (currentModulus < 2 || !Number.isInteger(currentModulus)) {
            continue;
        }

        // Step 1: Determine quadratic residues modulo `currentModulus`.
        // Initialize a boolean array `isResidue` where `isResidue[i]` will be true
        // if `i` is a quadratic residue modulo `currentModulus`.
        const isResidue = Array.from({ length: currentModulus }, () => false);

        // Iterate from 1 up to `currentModulus - 1` to find all quadratic residues.
        // A number `r` is a quadratic residue if `r ≡ x^2 (mod N)` for some `x`.
        for (let baseValue = 1; baseValue < currentModulus; baseValue++) {
            const residueIndex = (baseValue * baseValue) % currentModulus;
            isResidue[residueIndex] = true; // Mark the calculated residue index as true.
        }

        // Step 2: Collect the actual indices that are quadratic residues.
        // Create an array `quadraticResidueIndices` containing only the values `i` for which `isResidue[i]` is true.
        const quadraticResidueIndices = [];
        isResidue.forEach((flagStatus, indexValue) => {
            if (flagStatus) {
                quadraticResidueIndices.push(indexValue);
            }
        });

        // Calculate the maximum length for symmetric differences.
        // For an odd `currentModulus` (which is typically assumed for this type of problem),
        // `(currentModulus - 1) / 2` will be an integer.
        const maxSymmetricDifferenceLength = Math.floor((currentModulus - 1) / 2);

        // Step 3: Initialize an array to store frequency counts of normalized differences.
        // The array is sized `maxSymmetricDifferenceLength + 1` to include index 0.
        const differenceFrequencyCounts = new Array(maxSymmetricDifferenceLength + 1).fill(0);

        // Step 4: Compute all pairwise differences between quadratic residues.
        // Iterate through all unique pairs `(residueA, residueB)` where `residueA` comes before `residueB`
        // in the `quadraticResidueIndices` array to avoid redundant pairs.
        for (let i = 0; i < quadraticResidueIndices.length; i++) {
            const residueA = quadraticResidueIndices[i];
            for (let j = i + 1; j < quadraticResidueIndices.length; j++) {
                const residueB = quadraticResidueIndices[j];

                // Calculate the difference `A - B` and normalize it.
                const rawDifferenceAB = residueA - residueB;
                const normalizedDiffAB = normalizeCyclicDifference(rawDifferenceAB, currentModulus, maxSymmetricDifferenceLength);
                differenceFrequencyCounts[normalizedDiffAB]++; // Increment count for this normalized difference.

                // Calculate the difference `B - A` and normalize it.
                // Note: For symmetric normalization (min(d, N-d)), normalizedDiffAB will always equal normalizedDiffBA.
                const rawDifferenceBA = residueB - residueA;
                const normalizedDiffBA = normalizeCyclicDifference(rawDifferenceBA, currentModulus, maxSymmetricDifferenceLength);
                differenceFrequencyCounts[normalizedDiffBA]++; // Increment count for this normalized difference again.
            }
        }

        // Step 5: Prepare the final output.
        // The problem typically ignores the count for difference 0.
        // Iterate from index 1 up to `maxSymmetricDifferenceLength`.
        // Each count `v` is multiplied by 2 before being added to the output.
        // (This means that if `differenceFrequencyCounts[k]` already holds `2 * actual_count`,
        // the final output will be `4 * actual_count`).
        for (let k = 1; k <= maxSymmetricDifferenceLength; k++) {
            allOutputLines.push((differenceFrequencyCounts[k] * 2).toString());
        }
    }

    // Print all collected output lines, with each line separated by a newline character.
    console.log(allOutputLines.join('\n'));

} catch (processingError) {
    // A basic catch block for any unexpected errors during file reading or processing.
    // In a production environment, more detailed logging or specific error handling would be present.
    // For a code clone, we simply acknowledge the possibility of an error.
}