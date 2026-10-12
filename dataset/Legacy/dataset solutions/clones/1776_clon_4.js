"use strict";

const processInput = (inputData) => {
    const inputLines = inputData.trim().split("\n");
    const [targetValue, countForbidden] = inputLines[0].split(" ").map(Number);

    let forbiddenSet = new Set();
    if (countForbidden > 0) {
        inputLines[1].split(" ").map(Number).forEach(num => forbiddenSet.add(num));
    }

    let bestCandidate = null;
    let minDifference = Infinity;

    for (let currentNumber = 0; currentNumber <= 100; currentNumber++) {
        if (!forbiddenSet.has(currentNumber)) {
            const currentDifference = Math.abs(targetValue - currentNumber);

            if (currentDifference < minDifference) {
                minDifference = currentDifference;
                bestCandidate = currentNumber;
            } else if (currentDifference === minDifference) {
                bestCandidate = Math.min(bestCandidate, currentNumber);
            }
        }
    }

    if (bestCandidate === null) {
        console.log(-1);
    } else {
        console.log(bestCandidate);
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
