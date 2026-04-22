"use strict";

/**
 * Recursively generates all unique subsets (combinations without repetition)
 * of a specified size from a given array of elements.
 *
 * @param {Array<any>} sourceElements - The array from which to pick elements.
 * @param {number} desiredSize - The desired size of each subset.
 * @returns {Array<Array<any>>} An array of arrays, where each inner array is a unique subset.
 */
const generateUniqueSubsets = (sourceElements, desiredSize) => {
    // Validate inputs: ensure source is an array, not empty, and desired size is positive.
    if (!Array.isArray(sourceElements) || sourceElements.length === 0 || desiredSize <= 0) {
        return []; // Return an empty array for invalid parameters.
    }

    // If the desired subset size is 1, simply wrap each element in its own array.
    if (desiredSize === 1) {
        return sourceElements.map(singleElement => [singleElement]);
    }

    // If the desired size exceeds the number of available elements, no subsets can be formed.
    if (desiredSize > sourceElements.length) {
        return [];
    }

    const compiledSubsets = []; // This array will store all generated unique combinations.

    // Iterate through each element in the source array using a traditional for loop.
    for (let currentIdx = 0; currentIdx < sourceElements.length; currentIdx++) {
        const currentItem = sourceElements[currentIdx];

        // Prepare the remaining elements for the recursive call by slicing the array.
        // This ensures elements are not reused in the same combination and maintains order.
        const remainingElements = sourceElements.slice(currentIdx + 1);

        // Recursively find smaller subsets from the remaining elements.
        const smallerSubsets = generateUniqueSubsets(
            remainingElements,
            desiredSize - 1 // Decrement the desired size for the next level of recursion.
        );

        // Combine the current element with each smaller subset found.
        for (let j = 0; j < smallerSubsets.length; j++) {
            const subSet = smallerSubsets[j];
            // Use the spread operator for efficient array concatenation.
            compiledSubsets.push([currentItem, ...subSet]);
        }
    }

    return compiledSubsets; // Return the collection of all unique subsets.
};

/**
 * Parses raw multi-line string input into structured data.
 * The first line is expected to be a count, followed by entries.
 *
 * @param {string} textInput - The raw string input from stdin.
 * @returns {{initialCount: number, entries: string[]}} An object containing the parsed count and an array of entries.
 */
const parseInputLines = (textInput) => {
    // Basic validation for the input string.
    if (typeof textInput !== 'string' || textInput.trim() === '') {
        console.error("Input processing error: Raw input is empty or invalid type.");
        return { initialCount: 0, entries: [] };
    }

    const lines = textInput.trim().split("\n");
    const firstLineValue = parseInt(lines[0], 10); // Parse the first line as an integer, specifying radix.

    // Validate the parsed count.
    if (isNaN(firstLineValue) || firstLineValue < 0) {
        console.error("Input processing error: Invalid numerical indicator for entries found.");
        return { initialCount: 0, entries: [] };
    }

    // Extract entries: The original code's behavior for `arg.splice(1, N + 1)`
    // means it takes `N+1` elements starting from the second line (index 1).
    // Replicate this behavior using `slice`.
    const extractedEntries = lines.slice(1, firstLineValue + 1 + 1);

    return {
        initialCount: firstLineValue, // This 'initialCount' is not directly used later but is parsed.
        entries: extractedEntries
    };
};

/**
 * Counts the occurrences of specific initial characters ('M', 'A', 'R', 'C', 'H')
 * in a list of string entries.
 *
 * @param {string[]} entryList - An array of strings (e.g., names).
 * @returns {number[]} An array containing counts for M, A, R, C, H in that order.
 */
const tallyInitialCharacters = (entryList) => {
    const relevantInitials = ['M', 'A', 'R', 'C', 'H'];
    // Use a Map for flexible counting, then convert to a fixed-order array.
    const countsMap = new Map(relevantInitials.map(char => [char, 0]));

    for (const entry of entryList) {
        // Ensure the entry is a non-empty string before processing.
        if (typeof entry === 'string' && entry.length > 0) {
            const firstChar = entry[0]; // Get the first character.
            // Increment count if the initial character is one of the relevant ones.
            if (countsMap.has(firstChar)) {
                countsMap.set(firstChar, countsMap.get(firstChar) + 1);
            }
        }
    }
    // Return counts in the predefined order of relevantInitials.
    return relevantInitials.map(char => countsMap.get(char));
};

/**
 * Main function to process the input data, perform calculations, and output the result.
 *
 * @param {string} rawData - The raw string data read from input.
 */
const processData = (rawData) => {
    // Step 1: Parse the raw input string into a structured format.
    const { initialCount: unusedCount, entries: parsedEntries } = parseInputLines(rawData);

    // If parsing failed or no entries, output 0 and exit.
    if (parsedEntries.length === 0) {
        console.log(0);
        return;
    }

    // Step 2: Calculate the frequency of 'M', 'A', 'R', 'C', 'H' as initial characters.
    const initialCharacterFrequencies = tallyInitialCharacters(parsedEntries);

    // Step 3: Dynamically generate combinations of indices for calculation.
    // The problem requires combinations of 3 counts from the 5 available (M,A,R,C,H).
    const availableIndices = [0, 1, 2, 3, 4]; // Indices corresponding to M, A, R, C, H counts.
    const combinationSize = 3; // We need triplets of indices.

    // Generate all unique combinations of 3 indices from the 5 available.
    // This replaces the hardcoded p, q, r arrays from the original.
    const indexTriplets = generateUniqueSubsets(availableIndices, combinationSize);

    // Step 4: Calculate the cumulative sum of products of frequencies for each triplet.
    let cumulativeProductSum = 0;

    // Iterate over each generated combination of three indices.
    for (const triplet of indexTriplets) {
        // Destructure the triplet for clearer access to individual indices.
        const [idxOne, idxTwo, idxThree] = triplet;

        // Retrieve the counts for the current indices from the frequency array.
        const countA = initialCharacterFrequencies[idxOne];
        const countB = initialCharacterFrequencies[idxTwo];
        const countC = initialCharacterFrequencies[idxThree];

        // Compute the product of these three counts.
        const currentProduct = countA * countB * countC;

        // Add the calculated product to the running total.
        cumulativeProductSum += currentProduct;
    }

    // Step 5: Output the final calculated result to standard output.
    console.log(cumulativeProductSum);
};

// Entry point for execution: Read input from stdin and pass it to the processing function.
try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processData(fileContent);
} catch (executionError) {
    // Catch and log any errors that occur during file reading or data processing.
    console.error("An error occurred during program execution:", executionError.message);
    // In a production environment, one might exit with a non-zero status code here.
    // process.exit(1);
}