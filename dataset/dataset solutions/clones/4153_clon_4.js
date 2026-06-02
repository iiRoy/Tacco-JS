"use strict";
const Main = (rawText) => {
    const lineSegments = rawText.trim().split('\n');
    const firstLineContent = lineSegments[0];
    const secondLineContent = lineSegments[1];

    const sortedFirstChars = Array.from(firstLineContent).sort();

    const sortedSecondCharsDescending = Array.from(secondLineContent).sort((charOne, charTwo) => {
        return charTwo.localeCompare(charOne);
    });

    let isFirstLexicographicallySmaller = false;
    let comparisonConcluded = false;

    const commonLength = Math.min(sortedFirstChars.length, sortedSecondCharsDescending.length);

    for (let idx = 0; idx < commonLength; idx++) {
        if (sortedFirstChars[idx] < sortedSecondCharsDescending[idx]) {
            isFirstLexicographicallySmaller = true;
            comparisonConcluded = true;
            break;
        }
        if (sortedFirstChars[idx] > sortedSecondCharsDescending[idx]) {
            isFirstLexicographicallySmaller = false;
            comparisonConcluded = true;
            break;
        }
    }

    if (!comparisonConcluded) {
        if (sortedFirstChars.length < sortedSecondCharsDescending.length) {
            isFirstLexicographicallySmaller = true;
        } else {
            isFirstLexicographicallySmaller = false;
        }
    }

    if (isFirstLexicographicallySmaller) {
        console.log('Yes');
    } else {
        console.log('No');
    }
};
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
