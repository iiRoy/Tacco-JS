function calculateUniqueSubsequences(inputStringRepresentation) {
    // Determine the effective length of the source string for subsequence generation.
    const sourceStringLength = inputStringRepresentation.length;
    let validSubsequenceCounter = 0; // Initialize a counter for valid subsequences.

    // If the input string is empty, no subsequences can be formed.
    if (sourceStringLength === 0) {
        return 0;
    }

    // Iterate through all possible bitmasks from 1 up to 2^sourceStringLength - 1.
    // Each 'patternIdentifier' represents a unique combination of characters
    // forming a subsequence. Starting from 1 ensures non-empty subsequences.
    const totalPossibleSubsequenceMasks = (1 << sourceStringLength);

    for (let patternIdentifier = 1; patternIdentifier < totalPossibleSubsequenceMasks; patternIdentifier++) {
        const currentSubsequenceCharacters = []; // Array to store characters for the current subsequence.
        const encounteredCharacters = new Set(); // Set to track unique characters within the current subsequence.
        let hasDuplicates = false; // Flag to indicate if duplicates are found during construction.

        // Iterate through each character of the original string, checking its corresponding bit in the mask.
        for (let charPosition = 0; charPosition < sourceStringLength; charPosition++) {
            // Check if the bit at 'charPosition' is set in 'patternIdentifier'.
            // If the bit is 1, it means the character at this position is included in the current subsequence.
            if (((patternIdentifier >> charPosition) & 1) === 1) {
                const characterToAdd = inputStringRepresentation[charPosition];
                currentSubsequenceCharacters.push(characterToAdd);

                // As we add characters, immediately check for duplicates using the Set.
                if (encounteredCharacters.has(characterToAdd)) {
                    hasDuplicates = true;
                    // Optimization: if a duplicate is found, this pattern is invalid.
                    // No need to process further characters for this specific pattern.
                    break;
                }
                encounteredCharacters.add(characterToAdd);
            }
        }

        // If no duplicates were found during the subsequence construction,
        // and the subsequence is not empty (which is guaranteed by starting patternIdentifier from 1),
        // then this is a valid unique-character subsequence.
        if (!hasDuplicates) {
            validSubsequenceCounter++;
        }
    }

    return validSubsequenceCounter; // Return the total count of unique-character subsequences.
}

// Renamed and refactored the main execution block for clarity.
function processInputData(rawTextInput) {
    // Split the raw input string by newline characters into an array of lines.
    const linesOfInput = rawTextInput.split("\n");

    // The problem statement implies the second line contains the string to be processed.
    // Convert this string into an array of individual characters for easier indexing.
    const mainStringAsChars = Array.from(linesOfInput[1]);

    // Calculate the result using the core logic and print it to the console.
    console.log(calculateUniqueSubsequences(mainStringAsChars));
}

// Execute the processing function by reading the entire content from standard input.
// This part remains functional to interface with the execution environment.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));