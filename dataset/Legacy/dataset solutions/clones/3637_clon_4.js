'use strict';

function evaluateString(sourceText) {
    const checkLowercase = (char) => char >= 'a' && char <= 'z';

    // Initial length check: strings shorter than 3 cannot satisfy 'AC' conditions.
    // The original code implicitly handles this, resulting in 'WA'.
    if (sourceText.length < 3) {
        return 'WA';
    }

    // First character must be 'A'.
    if (sourceText[0] !== 'A') {
        return 'WA';
    }

    // Extract the segment where 'C' is allowed: from index 2 up to (but not including) the last character.
    // This corresponds to arg[2] through arg[arg.length - 2] in the original.
    const centralSegment = sourceText.slice(2, -1);

    // Count occurrences of 'C' in the central segment. Must be exactly one.
    const cOccurrences = Array.from(centralSegment).filter(unit => unit === 'C').length;
    if (cOccurrences !== 1) {
        return 'WA';
    }

    // Find the actual index of the single 'C' within the original string.
    // We know it exists and is unique in the centralSegment, so it must be in the range [2, sourceText.length - 2].
    const cPosition = sourceText.indexOf('C', 2);

    // Validate all other characters:
    // All characters from index 1 to the end (excluding the initial 'A' and the single 'C')
    // must be lowercase letters.
    const remainingCharsValid = Array.from(sourceText).slice(1).every((charUnit, relativeIndex) => {
        const absoluteIndex = relativeIndex + 1; // Convert relative index to absolute index in sourceText

        // If this character is the allowed 'C', it's valid.
        if (absoluteIndex === cPosition) {
            return charUnit === 'C';
        }
        // Otherwise, it must be a lowercase letter.
        return checkLowercase(charUnit);
    });

    if (!remainingCharsValid) {
        return 'WA';
    }

    // If all checks pass, the string is 'AC'.
    return 'AC';
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(evaluateString(fileContent));
