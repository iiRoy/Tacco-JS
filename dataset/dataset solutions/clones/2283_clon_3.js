"use strict"; // Enforce strict parsing and error handling for robust code execution

// This is the primary entry point for processing the input and orchestrating the permutation rank calculation.
function evaluatePermutationRanks(rawInputData) {
    // --- Input Validation and Pre-processing ---

    // Ensure the input data is a non-empty string.
    if (typeof rawInputData !== 'string' || rawInputData.trim().length === 0) {
        console.error("Input processing failed: Provided data is either not a string or is empty.");
        return; // Terminate execution if input is invalid.
    }

    // Split the raw input string into an array of lines, removing any leading/trailing whitespace from the whole input.
    const inputLines = rawInputData.trim().split("\n");

    // Define the minimum number of lines expected for valid problem input.
    const EXPECTED_LINE_COUNT = 3;
    if (inputLines.length < EXPECTED_LINE_COUNT) {
        console.error(`Input processing failed: Expected at least ${EXPECTED_LINE_COUNT} lines, but received ${inputLines.length}.`);
        return;
    }

    // Helper function to safely parse a line of space-separated values into an array of strings.
    const extractSequenceFromLine = (lineContent) => {
        if (!lineContent || lineContent.trim().length === 0) {
            console.warn("Warning: Attempted to parse an empty or whitespace-only line for a sequence.");
            return []; // Return an empty array if the line is empty.
        }
        return lineContent.split(" ");
    };

    // Extract the two sequences (corresponding to 'p' and 'q' in the original problem statement)
    // from the second and third lines of the input. The first line (index 0) is often a count 'N',
    // which is not directly used in this specific problem's logic.
    const firstSequenceElements = extractSequenceFromLine(inputLines[1]); // Original 'p'
    const secondSequenceElements = extractSequenceFromLine(inputLines[2]); // Original 'q'

    // Validate that the extracted sequences are not empty.
    if (firstSequenceElements.length === 0 || secondSequenceElements.length === 0) {
        console.error("Input processing failed: One or both target sequences are empty after parsing.");
        return;
    }

    // --- Permutation Generation ---

    // Generate all unique permutations of the elements found in the 'firstSequenceElements'.
    // The permutations will have a length equal to the number of elements in the first sequence.
    let allGeneratedPermutationArrays = computePermutations(firstSequenceElements, firstSequenceElements.length);

    if (allGeneratedPermutationArrays.length === 0) {
        console.error("Permutation generation failed: No permutations were produced. Check input data or algorithm logic.");
        return;
    }

    // Convert each permutation (which is an array of strings) into a single concatenated string.
    // This allows for lexicographical sorting and direct string comparison.
    const sortedPermutationStrings = allGeneratedPermutationArrays.map(permutation => permutation.join(""));

    // Sort the list of all permutation strings lexicographically. This establishes their 'rank'.
    sortedPermutationStrings.sort();

    // --- Rank Determination ---

    // Convert the specific first and second sequences into their string representations for ranking.
    const firstSequenceString = firstSequenceElements.join("");
    const secondSequenceString = secondSequenceElements.join("");

    let rankOfFirstSequence = -1;  // Stores the 0-based index (rank) of the first sequence.
    let rankOfSecondSequence = -1; // Stores the 0-based index (rank) of the second sequence.

    // Iterate through the sorted list of permutation strings to find the ranks of our two target sequences.
    // The loop includes an optimization to break early once both ranks have been identified.
    for (let currentRankIndex = 0; currentRankIndex < sortedPermutationStrings.length; currentRankIndex++) {
        const currentPermutationAsString = sortedPermutationStrings[currentRankIndex];

        // If the rank of the first sequence hasn't been found yet, check if the current permutation matches.
        if (rankOfFirstSequence === -1 && currentPermutationAsString === firstSequenceString) {
            rankOfFirstSequence = currentRankIndex;
        }

        // If the rank of the second sequence hasn't been found yet, check if the current permutation matches.
        if (rankOfSecondSequence === -1 && currentPermutationAsString === secondSequenceString) {
            rankOfSecondSequence = currentRankIndex;
        }

        // If both ranks have been successfully determined, there's no need to continue the loop.
        if (rankOfFirstSequence !== -1 && rankOfSecondSequence !== -1) {
            break;
        }
    }

    // Final validation: Ensure both ranks were actually found.
    if (rankOfFirstSequence === -1 || rankOfSecondSequence === -1) {
        console.error("Rank determination failed: Could not find the rank for one or both target sequences. This indicates an unexpected state.");
        return;
    }

    // --- Result Calculation and Output ---

    // Calculate the absolute difference between the two determined ranks.
    const absoluteRankDifference = Math.abs(rankOfFirstSequence - rankOfSecondSequence);

    // Output the final result to the console.
    console.log(absoluteRankDifference);
}

/**
 * Recursively computes all unique permutations of a specified length from a given set of elements.
 * This implementation uses a backtracking approach.
 *
 * @param {Array<string>} sourceElements - An array of string elements from which to generate permutations.
 * @param {number} desiredPermutationLength - The fixed length of each permutation to be generated.
 * @returns {Array<Array<string>>} An array where each element is a permutation (an array of strings).
 */
function computePermutations(sourceElements, desiredPermutationLength) {
    // Initialize an array to accumulate all generated permutations.
    let generatedPermutations = [];

    // --- Base Cases and Guard Conditions ---

    // If the desired permutation length is 0, the only permutation is an empty array.
    if (desiredPermutationLength === 0) {
        return [[]];
    }

    // If there are fewer source elements than the desired permutation length,
    // it's impossible to form permutations of that length.
    if (sourceElements.length < desiredPermutationLength) {
        return []; // Return an empty array as no permutations can be formed.
    }

    // Base case for recursion: If we need permutations of length 1,
    // each individual element from the source array is a valid permutation.
    if (desiredPermutationLength === 1) {
        // Map each element to a new array containing just that element.
        return sourceElements.map(element => [element]);
    }

    // --- Recursive Step (Backtracking Logic) ---

    // Iterate through each element in the current set of source elements.
    for (let currentElementIndex = 0; currentElementIndex < sourceElements.length; currentElementIndex++) {
        const chosenElement = sourceElements[currentElementIndex];

        // Create a new array of remaining elements by excluding the 'chosenElement'.
        // We make a shallow copy using slice() first to avoid mutating the original sourceElements array,
        // then use splice() to remove the current element.
        let remainingElementsForRecursion = sourceElements.slice();
        remainingElementsForRecursion.splice(currentElementIndex, 1); // Remove the element at the current index.

        // Recursively call 'computePermutations' to find all permutations
        // of the 'remainingElementsForRecursion' with a length reduced by one.
        const subPermutations = computePermutations(remainingElementsForRecursion, desiredPermutationLength - 1);

        // For each sub-permutation returned by the recursive call,
        // prepend the 'chosenElement' to form a complete permutation of the desired length.
        subPermutations.forEach(subPerm => {
            generatedPermutations.push([chosenElement].concat(subPerm));
        });
    }

    // Return the full list of all permutations found.
    return generatedPermutations;
}

// --- Program Execution Block ---

// This block handles reading input from standard input and initiating the main processing function.
try {
    // Dynamically require the 'fs' (file system) module, common in Node.js environments for I/O.
    const fileSystemHandler = require('fs');
    // Read the entire content of '/dev/stdin' (standard input) as a UTF-8 encoded string.
    const inputContentFromStdin = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Call the main processing function with the collected input.
    evaluatePermutationRanks(inputContentFromStdin);
} catch (ioError) {
    // Catch and report any errors that occur during file reading or initial execution.
    console.error("An unhandled error occurred during program initialization or I/O operation:", ioError.message);
    // For more detailed debugging, uncomment the line below to show the full stack trace.
    // console.error(ioError.stack);
}