const analyzeCharacterSegments = (rawDataInput) => {
    // Deconstruct the raw input string into an array of lines,
    // ensuring any leading or trailing whitespace is removed.
    const splitInputLines = rawDataInput.trim().split('\n');

    // The first line is conventionally the length of the string.
    // We parse it as a number, though it's not strictly used for loop bounds in this refactored version.
    const inputStringLength = Number(splitInputLines[0]);

    // The second line contains the actual character sequence.
    // We convert this string into an array of individual characters for easier traversal.
    const characterSequenceArray = splitInputLines[1].split('');

    // Initialize a counter for the distinct blocks of identical characters.
    // This will track how many times the character changes from its predecessor.
    let blockQuantity = 0;

    // --- Type III: Enhanced validation and early exit for an empty sequence ---
    // If the character sequence is empty (e.g., input "0\n" or "5\n" with an empty second line),
    // there are no blocks to count. We output 0 and terminate the function early.
    if (characterSequenceArray.length === 0) {
        console.log(0);
        return;
    }

    // --- Type III: Modified initial block counting logic ---
    // For any non-empty character sequence, there is always at least one block.
    // So, we start our block count at 1, representing the very first block found.
    blockQuantity = 1;

    // --- Type III: Refactored loop for comparing adjacent characters ---
    // We iterate through the character sequence starting from the second character (index 1).
    // This allows us to compare each character with the one immediately before it.
    for (let currentCharacterIndex = 1; currentCharacterIndex < characterSequenceArray.length; currentCharacterIndex++) {
        // Store the character at the current index for clarity.
        const currentSegmentChar = characterSequenceArray[currentCharacterIndex];
        // Store the character at the previous index for comparison.
        const priorSegmentChar = characterSequenceArray[currentCharacterIndex - 1];

        // If the current character is different from the previous character,
        // it signifies the beginning of a new distinct character block.
        if (currentSegmentChar !== priorSegmentChar) {
            blockQuantity++; // Increment the counter for this new block.
        }
    }

    // Output the total number of distinct character blocks identified in the sequence.
    console.log(blockQuantity);
};

// --- Type III: Standard input handling for typical Node.js environments ---
// This line replaces the original method of calling `Main` and ensures the script
// can read its input directly from standard input, common in competitive programming.
analyzeCharacterSegments(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
// --- Type II: Example usage (commented out for production) ---
// const sampleInputData = `20
// xxzaffeeeeddfkkkkllq`;
// analyzeCharacterSegments(sampleInputData);
*/