"use strict";

const processInput = (rawData) => {
    const parsedLines = rawData.trim().split('\n');
    const elementCount = parseInt(parsedLines[0], 10);
    const numberSequence = parsedLines[1].split(' ').map(Number);

    const totalSum = numberSequence.slice(0, elementCount).reduce((accumulator, currentVal) => accumulator + currentVal, 0);
    const targetHalfSum = totalSum / 2;

    const finalAccumulation = numberSequence.slice(0, elementCount).reduce((state, currentElement) => {
        let { firstSum, secondSum, targetExceeded } = state;

        if (!targetExceeded && firstSum < targetHalfSum) {
            firstSum += currentElement;
            if (firstSum >= targetHalfSum) {
                targetExceeded = true;
            }
        } else if (targetExceeded && firstSum > targetHalfSum) {
            secondSum += currentElement;
        }

        return { firstSum, secondSum, targetExceeded };
    }, { firstSum: 0, secondSum: 0, targetExceeded: false });

    console.log(finalAccumulation.firstSum - finalAccumulation.secondSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
