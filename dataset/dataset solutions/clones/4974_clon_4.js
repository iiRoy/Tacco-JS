'use strict';

const processInput = (sourceText) => {
    const digitChars = sourceText.trim().split('');
    let totalSum = 0;

    if (digitChars.length === 0) {
        console.log(0);
        return;
    }

    const exploreCombinations = (currentIdx, accumulatedValue, currentSegmentString) => {
        if (currentIdx === digitChars.length) {
            totalSum += accumulatedValue + parseInt(currentSegmentString, 10);
            return;
        }

        const nextDigitChar = digitChars[currentIdx];

        exploreCombinations(currentIdx + 1, accumulatedValue, currentSegmentString + nextDigitChar);

        exploreCombinations(currentIdx + 1, accumulatedValue + parseInt(currentSegmentString, 10), nextDigitChar);
    };

    exploreCombinations(1, 0, digitChars[0]);

    console.log(totalSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
