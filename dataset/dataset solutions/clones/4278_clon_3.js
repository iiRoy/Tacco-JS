const inputBuffer = [];
const inputInterface = require('readline');

// Establish an interface for reading input lines and writing output.
const lineReader = inputInterface.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Register an event listener to capture each incoming line of text.
lineReader.on('line', (currentInputLine) => {
    inputBuffer.push(currentInputLine); // Append the current line to our collection.
});

// Register an event listener for when the input stream concludes.
lineReader.on('close', () => {
    // Parse the main string and the pattern string from the collected input,
    // converting them into character arrays for element-wise processing.
    const primarySequence = inputBuffer[0].split(''); // Original S_
    const patternToFind = inputBuffer[1].split('');   // Original T

    // Initialize a variable to track the successful starting position of the pattern.
    // A value of -1 indicates that no suitable match has been identified yet.
    let foundMatchStartPos = -1; // Original ans

    // --- Structural Addition: Early Exit / Guard Clause ---
    // If the pattern string is longer than the primary sequence, a match is impossible.
    if (patternToFind.length > primarySequence.length) {
        console.log("UNRESTORABLE");
        return; // Terminate execution as no solution exists.
    }

    // --- Structural Addition: Helper Function ---
    // Defines a utility function to check if a character from the main sequence
    // is compatible with a character from the pattern. Compatibility means they are identical
    // or the main sequence character is a wildcard ('?').
    const checkCharCompatibility = (mainChar, patternChar) => {
        return mainChar === patternChar || mainChar === '?';
    };

    // --- Structural Update: Loop Condition and Variable Naming ---
    // Iterate through the primary sequence from right to left.
    // 'candidateEndIndex' represents the potential ending position of the pattern within 'primarySequence'.
    // The loop continues as long as there is enough space remaining for the 'patternToFind'.
    for (let candidateEndIndex = primarySequence.length - 1;
         candidateEndIndex >= patternToFind.length - 1;
         candidateEndIndex--)
    {
        // --- Structural Addition: Intermediate Variable ---
        // Calculate the precise starting index for the current segment being evaluated.
        const currentSegmentStartIndex = candidateEndIndex - patternToFind.length + 1;

        // Extract the current segment from the primary sequence that aligns with the pattern's length.
        // Using .slice() creates a new array without modifying the original.
        const currentPrimarySegment = primarySequence.slice(currentSegmentStartIndex, currentSegmentStartIndex + patternToFind.length); // Original str_S

        // --- Structural Addition: Boolean Flag for Match Status ---
        let isSegmentPerfectMatch = true; // Assume a match until proven otherwise.

        // Compare each character of the 'patternToFind' with the 'currentPrimarySegment'.
        for (let patternCharIterator = 0; patternCharIterator < patternToFind.length; patternCharIterator++) { // Original j
            // --- Structural Update: Logic Simplification using Helper Function ---
            // If any character pair is not compatible, then this segment is not a match.
            if (!checkCharCompatibility(currentPrimarySegment[patternCharIterator], patternToFind[patternCharIterator])) {
                isSegmentPerfectMatch = false; // Mark as non-matching.
                break; // No need to check further characters in this segment.
            }
        }

        // If 'isSegmentPerfectMatch' remains true after the inner loop, a valid match is found.
        if (isSegmentPerfectMatch) {
            foundMatchStartPos = currentSegmentStartIndex; // Record the starting position.
            // Since we're iterating from right to left, the first match found is the rightmost one.
            break; // Exit the outer loop as the desired match has been located.
        }
    }

    // --- Structural Update: Output Logic and String Reconstruction ---
    // Determine the final output based on whether a match was found.
    if (foundMatchStartPos === -1) {
        // If 'foundMatchStartPos' is still -1, no restorable pattern was found.
        console.log("UNRESTORABLE");
    } else {
        // If a match was found, proceed with reconstructing the string.
        // --- Structural Addition: New Array for Reconstruction ---
        // Create a new array to build the final string, avoiding direct in-place modification
        // complexities and ensuring a clean reconstruction process.
        const finalRestoredSequence = new Array(primarySequence.length);

        // Iterate through each character position of the original primary sequence.
        for (let charPosition = 0; charPosition < primarySequence.length; charPosition++) { // Original i
            // Check if the current position falls within the range of the successfully matched pattern.
            if (charPosition >= foundMatchStartPos && charPosition < foundMatchStartPos + patternToFind.length) {
                // If it's part of the matched pattern, use the character from the pattern.
                finalRestoredSequence[charPosition] = patternToFind[charPosition - foundMatchStartPos];
            } else if (primarySequence[charPosition] === '?') {
                // If it's a wildcard '?' outside the matched pattern area, replace it with 'a'.
                finalRestoredSequence[charPosition] = 'a';
            } else {
                // Otherwise, retain the original character from the primary sequence.
                finalRestoredSequence[charPosition] = primarySequence[charPosition];
            }
        }
        // Join the characters in the new array to form the final string and display it.
        console.log(finalRestoredSequence.join(''));
    }
});