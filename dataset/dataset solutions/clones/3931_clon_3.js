function SequenceProcessor(inputStringValue) {
    const stringLength = inputStringValue.length;
    const baseCharacterOffset = 'a'.charCodeAt(0); // Numerical value for 'a'

    // Helper function to convert a numeric offset (0-25) back to a character
    const convertOffsetToChar = (offsetValue) => String.fromCharCode(baseCharacterOffset + offsetValue);
    // Helper function to convert a character to its numeric offset from 'a'
    const convertCharToOffset = (charValue) => charValue.charCodeAt(0) - baseCharacterOffset;

    let resultantSequence = inputStringValue; // Mutable variable to hold the sequence under modification

    // --- Branch 1: String length is less than the full alphabet (26 characters) ---
    if (stringLength < 26) {
        // Type III: Using a Set for efficient tracking of missing characters.
        // This is a structural change from using a numeric array.
        const availableAlphabetCharacters = new Set();
        // Populate the set with all lowercase alphabet characters
        for (let charIndex = 0; charIndex < 26; charIndex++) {
            availableAlphabetCharacters.add(convertOffsetToChar(charIndex));
        }

        // Type III: Iterate using for...of for string characters (more modern JS)
        // Remove characters that are already present in the input string
        for (const charPresent of inputStringValue) {
            availableAlphabetCharacters.delete(charPresent);
        }

        let nextSmallestCharacter = null;
        // Type III: Iterate from 'a' to 'z' to find the first character not in the input string
        for (let charOffset = 0; charOffset < 26; charOffset++) {
            const candidateChar = convertOffsetToChar(charOffset);
            if (availableAlphabetCharacters.has(candidateChar)) {
                nextSmallestCharacter = candidateChar;
                break; // Found the lexicographically smallest missing character
            }
        }

        // Type III: Explicit check and concatenation, adding a step for clarity
        if (nextSmallestCharacter !== null) {
            resultantSequence += nextSmallestCharacter;
        }
        // (No 'else' needed here, as problem constraints imply a character will always be found if length < 26)
    }
    // --- Branch 2: String length is exactly 26 characters ---
    else {
        // Type III: Define a constant for the specific "largest" string for clarity
        const largestPermutationString = "zyxwvutsrqponmlkjihgfedcba";

        // Type II: Renamed variables for better readability and semantic meaning
        // Check if the input is the lexicographically largest possible unique-character string
        if (resultantSequence === largestPermutationString) {
            process.stdout.write("-1\n"); // Type III: Use process.stdout.write for output
            return; // Terminate function execution
        }

        // Type III: Use a boolean array for tracking character presence in the suffix.
        // `true` means the character IS present in the current suffix context.
        const charAvailabilityInSuffix = new Array(26).fill(false);

        // Type III: Use a flag to manage loop termination instead of a labeled break
        let modificationSuccessful = false;

        // Mark the last character of the current sequence as present in the suffix
        charAvailabilityInSuffix[convertCharToOffset(resultantSequence[25])] = true;

        // Iterate backwards from the second-to-last character (index 24)
        for (let currentPositionIdx = 24; currentPositionIdx >= 0; currentPositionIdx--) {
            // Type III: Store current character's offset in a temporary variable
            const currentCharacterOffset = convertCharToOffset(resultantSequence[currentPositionIdx]);

            // Attempt to find a replacement character for the current position
            for (let potentialReplacementOffset = currentCharacterOffset; potentialReplacementOffset < 26; potentialReplacementOffset++) {
                // Original logic: if `b[j] === 0` (meaning char `j` IS present)
                // My clone logic: if `charAvailabilityInSuffix[potentialReplacementOffset]` is `true`
                if (charAvailabilityInSuffix[potentialReplacementOffset]) {
                    // Type III: Explicitly extract prefix and construct new sequence
                    const sequencePrefix = resultantSequence.substring(0, currentPositionIdx);
                    const chosenReplacementChar = convertOffsetToChar(potentialReplacementOffset);
                    resultantSequence = sequencePrefix + chosenReplacementChar;
                    modificationSuccessful = true;
                    break; // Exit the inner loop (found replacement for current position)
                }
            }

            if (modificationSuccessful) {
                break; // Exit the outer loop (string has been modified)
            }

            // Mark the character at the current position as present for subsequent iterations (further left)
            charAvailabilityInSuffix[currentCharacterOffset] = true;
        }
    }

    // Output the resulting sequence to standard output
    process.stdout.write(resultantSequence + "\n");
}

// Type III: Wrap the main execution in an Immediately Invoked Function Expression (IIFE)
// for better scope management and to simulate a main entry point.
(function programEntrypoint() {
    // Type II: Use more explicit variable names for file operations
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin";
    const fileEncoding = "utf8";

    let rawInputContent;
    // Type III: Add a try-catch block for robust file reading
    try {
        rawInputContent = fileSystemModule.readFileSync(standardInputPath, fileEncoding);
    } catch (errorReadingFile) {
        // Type III: Enhanced error handling. In a real scenario, might log and exit gracefully.
        console.error("Critical error: Unable to read input from", standardInputPath, "\nDetails:", errorReadingFile.message);
        // For this clone, re-throwing ensures similar failure behavior if input is missing.
        throw errorReadingFile; 
    }

    // Type II: Call the renamed main function with the processed input
    // .trim() is essential to remove trailing newlines from readFileSync.
    SequenceProcessor(rawInputContent.trim());
})();