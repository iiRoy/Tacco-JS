"use strict";

const parseNumericalSequence = (textualData) => textualData.split(/\s+/).map(Number);

const determineGameOutcome = (rawGameData) => {
    const allParsedNumbers = parseNumericalSequence(rawGameData);

    const numberOfPiles = allParsedNumbers[0];

    const actualPileDimensions = allParsedNumbers.slice(1, numberOfPiles + 1);

    actualPileDimensions.sort((valA, valB) => valA - valB);

    const criticalOddPileTally = actualPileDimensions.reduce((currentTally, currentDimension, currentIndex, fullArray) => {
        const isMaxDimension = currentIndex === fullArray.length - 1;
        const isDimensionOdd = currentDimension % 2 !== 0;

        if ((isMaxDimension && isDimensionOdd) || (!isMaxDimension && isDimensionOdd && currentDimension > 1)) {
            return currentTally + 1;
        }
        return currentTally;
    }, 0);

    const playerOneIsVictor = criticalOddPileTally % 2 !== 0;

    console.log(playerOneIsVictor ? 'first' : 'second');
};

determineGameOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));
