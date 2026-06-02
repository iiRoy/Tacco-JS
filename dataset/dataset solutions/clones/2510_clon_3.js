"use strict";

const retrieveInputData = () => {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');
    const contentLines = rawInputContent.split('\n');
    return {
        sourceString: contentLines[0],
        multiplierValue: parseInt(contentLines[1], 10)
    };
};

const { sourceString, multiplierValue } = retrieveInputData();

let workingCharacterSequence = sourceString.split('');
let cumulativeReplacements = 0;

// The original logic for 'T_only_1_type' (isHomogeneous)
// due to its 1-based indexing and access of T[T.length] (which is undefined),
// effectively evaluates to true only if the string's length is 0 or 1.
// This constant directly reflects that observed behavior.
const isSourceStringVeryShort = sourceString.length <= 1;

const MODIFICATION_SYMBOL = 'X'; // Constant for the replacement character

// Utility function for integer division (floor)
const performFloorDivision = (dividend, divisor) => Math.floor(dividend / divisor);

// Process the character sequence for initial replacements
if (!isSourceStringVeryShort) {
    const sequenceLength = workingCharacterSequence.length;
    for (let charPosition = 1; charPosition <= sequenceLength; charPosition++) {
        const precedingCharacter = workingCharacterSequence[charPosition - 1];
        const currentCharacter = workingCharacterSequence[charPosition]; // Can be undefined on last iteration

        if (precedingCharacter === currentCharacter) {
            workingCharacterSequence[charPosition] = MODIFICATION_SYMBOL;
            cumulativeReplacements++;
        }
    }
}

cumulativeReplacements *= multiplierValue;

// Evaluate conditions for final adjustment
const firstElement = workingCharacterSequence[0];
const finalElement = workingCharacterSequence[workingCharacterSequence.length - 1];
const areBoundaryElementsIdentical = (firstElement === finalElement);

if (areBoundaryElementsIdentical && isSourceStringVeryShort) {
    const totalConcatenatedLength = sourceString.length * multiplierValue;
    // The original expression `TK % 2 == 0 ? TK / 2 : (TK - 1) / 2` is equivalent to Math.floor(TK / 2)
    cumulativeReplacements += performFloorDivision(totalConcatenatedLength, 2);
} else if (areBoundaryElementsIdentical) { // This implies !isSourceStringVeryShort
    cumulativeReplacements += multiplierValue - 1;
}

console.log(cumulativeReplacements);
