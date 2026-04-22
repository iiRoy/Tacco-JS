// This module handles standard input operations, abstracting away direct file system calls.
const inputSourceProcessor = {
    // The designated path for reading input, typically standard input in competitive programming environments.
    standardInputFilePath: '/dev/stdin',

    /**
     * Reads raw text from a specified file path, processes it, and returns an array of numbers.
     * Includes error handling and robust parsing.
     * @param {string} sourcePath - The file path to read from.
     * @returns {number[]} An array of integers derived from the input, or an empty array on failure.
     */
    retrieveNumericSequence: (sourcePath) => {
        try {
            // Synchronously read the entire content of the file as UTF-8 text.
            const rawContentBuffer = require('fs').readFileSync(sourcePath, 'utf8');
            
            // Normalize whitespace, split the content into individual lines.
            const contentLines = rawContentBuffer.trim().split('\n');
            
            // Filter out any blank lines and attempt to parse each remaining line as an integer.
            const parsedNumbers = contentLines
                .filter(lineSegment => lineSegment.length > 0) // Ensure line is not empty
                .map(lineSegment => {
                    const parsed = parseInt(lineSegment.trim(), 10); // Parse with base 10
                    if (isNaN(parsed)) {
                        console.warn(`Encountered non-numeric input "${lineSegment.trim()}". Skipping this value.`);
                        return undefined; // Mark as undefined for filtering later
                    }
                    return parsed;
                })
                .filter(num => num !== undefined); // Remove any skipped non-numeric values

            if (parsedNumbers.length === 0 && contentLines.length > 0) {
                console.error("Warning: All input lines were non-numeric or empty after processing.");
            }

            return parsedNumbers;

        } catch (readOperationError) {
            console.error(`Error reading from ${sourcePath}: ${readOperationError.message}`);
            // Return an empty array to gracefully handle file access issues.
            return [];
        }
    }
};

/**
 * Computes the frequency of cyclic distances between quadratic residues for a given modulus.
 * This function encapsulates the core logic for a single 'n' value.
 * @param {number} currentModulusValue - The integer 'n' for which to calculate residue distances.
 * @returns {number[]} An array where each index 'k' (from 1 to (n-1)/2) holds the count of pairs
 *                     of quadratic residues with a cyclic distance of 'k'. Returns an empty array
 *                     if the modulus is invalid or results in no distances.
 */
function calculateQuadraticResidueDistances(currentModulusValue) {
    // Input validation: Modulus must be a positive integer.
    if (typeof currentModulusValue !== 'number' || !Number.isInteger(currentModulusValue) || currentModulusValue <= 0) {
        // For '0', the main loop terminates. For other invalid values, we simply return no results.
        console.warn(`Invalid modulus value provided: ${currentModulusValue}. Skipping calculation.`);
        return [];
    }

    // Special case for modulus 1: There are no non-trivial quadratic residues (only 0).
    // The distance calculation would be undefined or result in an empty set.
    if (currentModulusValue === 1) {
        return [];
    }

    // Use a Set to store unique quadratic residues efficiently.
    const uniqueResidues = new Set();
    // Iterate from 1 up to (but not including) the modulus to find all quadratic residues.
    for (let currentNumber = 1; currentNumber < currentModulusValue; currentNumber++) {
        uniqueResidues.add((currentNumber * currentNumber) % currentModulusValue);
    }

    // Convert the Set to a sorted Array for deterministic iteration and pair processing.
    const sortedResidueList = Array.from(uniqueResidues).sort((a, b) => a - b);

    // Calculate the maximum relevant cyclic distance. For a modulus 'n', distances are symmetric
    // around n/2, so we only need to consider distances up to floor((n-1)/2).
    const maximumCyclicDistance = Math.floor((currentModulusValue - 1) / 2);
    
    // Initialize an array to store the frequency counts for each distance.
    // The size is `maximumCyclicDistance + 1` to accommodate indices from 0 to maximumCyclicDistance.
    // Index 0 will represent distance 0, which is typically not outputted.
    const distanceFrequencyCounts = new Array(maximumCyclicDistance + 1).fill(0);

    // Iterate through all unique pairs of residues to compute their cyclic distances.
    for (let outerPosition = 0; outerPosition < sortedResidueList.length; outerPosition++) {
        for (let innerPosition = outerPosition + 1; innerPosition < sortedResidueList.length; innerPosition++) {
            const residueOne = sortedResidueList[outerPosition];
            const residueTwo = sortedResidueList[innerPosition];

            // Calculate the absolute difference between the two residues.
            const absoluteDifference = Math.abs(residueOne - residueTwo);

            // Determine the shortest cyclic distance. For a cycle of size 'n', the distance between
            // 'a' and 'b' is either |a-b| or n - |a-b|. We take the minimum of these two.
            const shortestCyclicDistance = Math.min(absoluteDifference, currentModulusValue - absoluteDifference);

            // Increment the frequency count for this shortest cyclic distance.
            // Each pair (residueOne, residueTwo) contributes two ways: (residueOne - residueTwo) and (residueTwo - residueOne),
            // both of which map to the same shortestCyclicDistance.
            // We ensure the distance is positive and within our tracked range.
            if (shortestCyclicDistance > 0 && shortestCyclicDistance <= maximumCyclicDistance) {
                distanceFrequencyCounts[shortestCyclicDistance] += 2;
            }
        }
    }

    // Return the frequency counts, excluding the count for distance 0 (index 0).
    // This aligns with the original problem's output format.
    return distanceFrequencyCounts.slice(1);
}

// Main execution routine, encapsulated in an Immediately Invoked Function Expression (IIFE).
(function mainApplicationRunner() {
    // Fetch the sequence of numerical inputs from the configured standard input path.
    const numericalSequence = inputSourceProcessor.retrieveNumericSequence(
        inputSourceProcessor.standardInputFilePath
    );

    // If no valid numbers were retrieved, log an error and exit.
    if (!numericalSequence || numericalSequence.length === 0) {
        console.error("No valid numeric input available for processing. Terminating.");
        return;
    }

    let currentInputIndex = 0; // Tracks the current position in the input sequence.
    let modulusToProcess; // Holds the current modulus value being processed.

    // Loop through the numerical sequence. The loop continues as long as there are numbers
    // and the current number (modulusToProcess) is not zero.
    // The index is incremented after assignment for the next iteration.
    while (currentInputIndex < numericalSequence.length &&
           (modulusToProcess = numericalSequence[currentInputIndex++]) !== 0) {

        // Compute the distance frequencies for the current modulus.
        const resultingFrequencies = calculateQuadraticResidueDistances(modulusToProcess);

        // Output each calculated frequency on a new line.
        // Only print if there are actual results.
        if (resultingFrequencies.length > 0) {
            resultingFrequencies.forEach(frequencyValue => {
                console.log(frequencyValue);
            });
        }
    }
})(); // Execute the main application runner.