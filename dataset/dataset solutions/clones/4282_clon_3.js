'use strict';

const processInput = rawData => {
    const inputLines = rawData.split('\n');
    const firstRelevantLine = inputLines[0];
    const targetString = firstRelevantLine.split(' ')[0];

    const stringLength = targetString.length;
    let patternFound = false;

    const SEARCH_SEQUENCE = 'AC';
    const SEQUENCE_LENGTH = SEARCH_SEQUENCE.length;

    for (let charIndex = 0; charIndex <= stringLength - SEQUENCE_LENGTH; charIndex++) {
        const currentSlice = targetString.substring(charIndex, charIndex + SEQUENCE_LENGTH);
        if (currentSlice === SEARCH_SEQUENCE) {
            patternFound = true;
            break;
        }
    }

    console.log(patternFound ? 'Yes' : 'No');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
