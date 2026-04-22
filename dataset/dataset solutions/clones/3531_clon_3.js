"use strict"; 

// Helper function to calculate the frequency distribution of lowercase English characters within a given text.
// This encapsulates the core character counting logic into a reusable module.
const calculateNormalizedCharFrequencies = (textInput) => {
    // Define the ASCII code range for lowercase 'a' to 'z'
    const CHAR_CODE_A = 'a'.charCodeAt(0);
    const CHAR_CODE_Z = 'z'.charCodeAt(0);
    const ALPHABET_SPAN = CHAR_CODE_Z - CHAR_CODE_A + 1; // Represents 26 characters

    // Initialize an array where each index corresponds to a character ('a' through 'z')
    // The value at each index will store the count of that character.
    // This is an alternative initialization to `[...Array(26)].fill(0)`.
    const frequencyRegister = Array.from({ length: ALPHABET_SPAN }, () => 0);

    // Iterate through each character of the input string to tally frequencies.
    for (let charPosition = 0; charPosition < textInput.length; charPosition++) {
        const currentCharacterCode = textInput.charCodeAt(charPosition);

        // Only count characters that fall within the 'a' through 'z' range.
        if (currentCharacterCode >= CHAR_CODE_A && currentCharacterCode <= CHAR_CODE_Z) {
            // Calculate the zero-based index for the character (e.g., 'a' -> 0, 'b' -> 1)
            const charIndex = currentCharacterCode - CHAR_CODE_A;
            frequencyRegister[charIndex]++; // Increment the count for this character
        }
        // Characters outside this range (e.g., uppercase, numbers, symbols) are ignored,
        // maintaining the original behavior's implicit scope.
    }
    return frequencyRegister; // Return the array of character counts
};

// The primary function responsible for processing the input and determining the outcome.
const executeCharacterAnalysis = (rawInputPayload) => {
    // First, clean up the raw input: remove leading/trailing whitespace and split into lines.
    const inputLines = rawInputPayload.trim().split('\n');

    // Add a validation step: ensure the input contains at least two lines.
    // This is a new guard clause not present in the original.
    if (inputLines.length < 2) {
        console.log("Error: Input must contain at least two lines for comparison.");
        console.log("No"); // Indicate failure due to malformed input.
        return; // Exit the function early.
    }

    // Assign the first and second lines to descriptive variable names.
    const firstTextSequence = inputLines[0];
    const secondTextSequence = inputLines[1];

    // Add another crucial guard clause: if the lengths of the two strings differ,
    // their character frequency distributions cannot possibly be identical.
    if (firstTextSequence.length !== secondTextSequence.length) {
        console.log("No");
        return; // Terminate early.
    }

    // Utilize the helper function to get the sorted frequency arrays for both sequences.
    const firstSequenceFrequencies = calculateNormalizedCharFrequencies(firstTextSequence);
    const secondSequenceFrequencies = calculateNormalizedCharFrequencies(secondTextSequence);

    // Sort both frequency arrays numerically in ascending order.
    // The sort comparison function remains standard (a-b for ascending).
    firstSequenceFrequencies.sort((valueA, valueB) => valueA - valueB);

    // --- Intentional Type III change: introduce an extra, functionally equivalent step ---
    // Sort the second array descending first, then re-sort it ascending.
    // This achieves the same final sorted state but involves an additional operation.
    secondSequenceFrequencies.sort((valueA, valueB) => valueB - valueA); // Sort descending
    secondSequenceFrequencies.sort((valueA, valueB) => valueA - valueB); // Re-sort ascending

    // Compare the sorted frequency arrays element by element.
    // This replaces the original `join("") === join("")` comparison, offering an alternative.
    let areFrequenciesMatching = true; // Flag to track if distributions are identical

    // Iterate through the arrays, assuming they are of equal length (due to earlier checks).
    for (let index = 0; index < firstSequenceFrequencies.length; index++) {
        // If any corresponding frequency count differs, the distributions are not identical.
        if (firstSequenceFrequencies[index] !== secondSequenceFrequencies[index]) {
            areFrequenciesMatching = false; // Set flag to false
            break; // Exit the loop immediately as a mismatch is found
        }
    }

    // Output the final determination based on the comparison result.
    if (areFrequenciesMatching) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// Invoke the main analysis routine with data read from standard input.
// This part of the input mechanism is typically preserved as it depends on the execution environment.
executeCharacterAnalysis(require('fs').readFileSync('/dev/stdin', 'utf8'));