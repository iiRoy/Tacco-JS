const ioModule = require('readline');
const acquiredInputLines = [];

const lineProcessor = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

lineProcessor.on('line', (currentInputLine) => {
    acquiredInputLines.push(currentInputLine);
});

lineProcessor.on('close', () => {
    const initialSourceSequence = Array.from(acquiredInputLines[0]);
    const targetPatternSequence = Array.from(acquiredInputLines[1]);

    const sourceLength = initialSourceSequence.length;
    const patternLength = targetPatternSequence.length;

    if (patternLength === 0) {
        console.log("UNRESTORABLE");
        return;
    }

    // Helper function to check if the pattern matches a segment of the source
    // at a given starting position, considering '?' as a wildcard.
    const checkCompatibility = (startPosition) => {
        // This check is technically redundant if `possibleStartIndices` is generated correctly
        if (startPosition + patternLength > sourceLength) {
            return false;
        }

        for (let patternCharOffset = 0; patternCharOffset < patternLength; patternCharOffset++) {
            const sourceChar = initialSourceSequence[startPosition + patternCharOffset];
            const patternChar = targetPatternSequence[patternCharOffset];

            if (sourceChar !== patternChar && sourceChar !== '?') {
                return false; // Mismatch and not a wildcard
            }
        }
        return true; // Full match found for this segment
    };

    let foundPatternStartIndex = undefined;

    // Generate an array of possible starting indices for the pattern in the source.
    // The original code's loop range implies checking from index 1 up to (sourceLength - patternLength).
    // It specifically skips index 0.
    const possibleStartIndices = [];
    for (let candidatePosition = sourceLength - patternLength; candidatePosition >= 1; --candidatePosition) {
        possibleStartIndices.push(candidatePosition);
    }

    // Use Array.prototype.find to get the rightmost valid starting index.
    // Because `possibleStartIndices` is built in descending order, `find` naturally
    // returns the rightmost (first one it encounters).
    foundPatternStartIndex = possibleStartIndices.find(checkCompatibility);

    if (foundPatternStartIndex === undefined) {
        console.log("UNRESTORABLE");
    } else {
        // Construct the final string using a functional map approach.
        const finalOutputChars = Array.from({ length: sourceLength }, (_, charIndex) => {
            // If the current character position falls within the identified pattern insertion range
            if (charIndex >= foundPatternStartIndex && charIndex < foundPatternStartIndex + patternLength) {
                // Use the character from the target pattern
                return targetPatternSequence[charIndex - foundPatternStartIndex];
            } else if (initialSourceSequence[charIndex] === '?') {
                // If it's a '?' outside the pattern insertion, replace with 'a'
                return 'a';
            } else {
                // Otherwise, keep the original character from the source
                return initialSourceSequence[charIndex];
            }
        });
        console.log(finalOutputChars.join(''));
    }
});