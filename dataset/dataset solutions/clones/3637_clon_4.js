'use strict';

const isFirstCharValidAndLengthSufficient = (inputString) => {
    return inputString.length >= 4 && inputString[0] === 'A';
};

const hasSingleValidC = (inputString) => {
    const characterDetails = [...inputString].map((symbol, location) => ({ symbol, location }));
    const cOccurrences = characterDetails.filter(item => item.symbol === 'C');

    if (cOccurrences.length !== 1) {
        return false;
    }

    const cPosition = cOccurrences[0].location;
    return cPosition >= 2 && cPosition <= inputString.length - 2;
};

const allNonSpecialCharsAreLowercase = (inputString) => {
    const cSpot = [...inputString].findIndex(glyph => glyph === 'C');

    const otherSymbols = [...inputString].filter((_, idx) => idx !== 0 && idx !== cSpot);

    return otherSymbols.every(element => element >= 'a' && element <= 'z');
};

const determineOutcome = (incomingData) => {
    if (isFirstCharValidAndLengthSufficient(incomingData) &&
        hasSingleValidC(incomingData) &&
        allNonSpecialCharsAreLowercase(incomingData)) {
        console.log('AC');
    } else {
        console.log('WA');
    }
};

determineOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));