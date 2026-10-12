'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const firstLineContent = sourceData[0];
let targetSequence = firstLineContent;

let finalVerdict = "Yes";
let isPatternValid = true;

function evaluateCharacterRule(charValue, positionIndex) {
    const isCurrentIndexOdd = (positionIndex % 2 !== 0);
    const isCurrentIndexEven = !isCurrentIndexOdd;

    if (isCurrentIndexOdd) {
        // For 0-based odd indices (1, 3, 5...), the character must not be 'R'.
        if (charValue === "R") {
            return false;
        }
    } else if (isCurrentIndexEven) {
        // For 0-based even indices (0, 2, 4...), the character must not be 'L'.
        if (charValue === "L") {
            return false;
        }
    }
    return true;
}

for (let currentIndex = 0; currentIndex < targetSequence.length; currentIndex++) {
    const currentCharacter = targetSequence[currentIndex];

    if (!evaluateCharacterRule(currentCharacter, currentIndex)) {
        isPatternValid = false;
        break;
    }
}

if (!isPatternValid) {
    finalVerdict = "No";
}

console.log(finalVerdict);
