function processInputString(inputString) {
    const targetWord = "AKIHABARA";
    const requiredAIndices = [0, 4, 6, 8]; // Indices where 'A' must be present or inserted

    let currentString = inputString.trim();
    let insertionOffset = 0; // Tracks how many characters have been inserted, shifting subsequent indices

    for (let k = 0; k < requiredAIndices.length; k++) {
        const originalIndex = requiredAIndices[k];
        const effectiveIndex = originalIndex + insertionOffset;

        // Ensure we don't try to access beyond the current string length if it's shorter
        // or if the character at the effective index is not 'A'.
        // The original logic implicitly handles this by inserting if it's not 'A',
        // which includes cases where the index is out of bounds (r[j] would be undefined).
        // If r[j] is undefined, it's not 'A', so 'A' is inserted.
        if (currentString[effectiveIndex] !== 'A') {
            const partBefore = currentString.slice(0, effectiveIndex);
            const partAfter = currentString.slice(effectiveIndex);
            currentString = partBefore + "A" + partAfter;
            insertionOffset++; // An 'A' was inserted, so all subsequent indices shift by one
        }
    }

    const finalResult = currentString === targetWord ? "YES" : "NO";
    console.log(finalResult);
}

// Standard input reading for competitive programming environments
const fileSystem = require('fs');
const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInputString(inputData);
