"use strict";

const processInput = rawData => {
    const lineData = rawData.trim().split("\n");
    const targetValue = parseInt(lineData[0].split(" ")[0]);
    const countForbidden = parseInt(lineData[0].split(" ")[1]);

    if (countForbidden === 0) {
        console.log(targetValue);
    } else {
        const forbiddenNumbers = lineData[1].split(" ").map(item => parseInt(item));

        const allPossibleRange = [...Array(100).keys()].map(indexVal => ++indexVal);
        allPossibleRange.unshift(0);

        const allowedNumbers = allPossibleRange.filter(item => forbiddenNumbers.indexOf(item) === -1);

        const finalOutcome = allowedNumbers.reduce((accumulator, currentElement) => {
            const accumulatorDifference = Math.abs(targetValue - accumulator);
            const currentDifference = Math.abs(targetValue - currentElement);

            if (accumulatorDifference === currentDifference) {
                return Math.min(accumulator, currentElement);
            } else if (accumulatorDifference > currentDifference) {
                return currentElement;
            } else {
                return accumulator;
            }
        }, 101);

        if (Math.abs(targetValue - finalOutcome) >= Math.abs(targetValue - (-1))) {
            console.log(-1);
        } else {
            console.log(finalOutcome);
        }
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
