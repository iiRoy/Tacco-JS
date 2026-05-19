"use strict";

const parseInputParameters = (rawInputString) => {
    const trimmedInput = rawInputString.trim();
    const firstLine = trimmedInput.split("\n")[0];
    const [nString, kString] = firstLine.split(" ");

    const totalItems = parseInt(nString, 10);
    const thresholdValue = parseInt(kString, 10);

    return { totalItems, thresholdValue };
};

const computeSuccessProbability = (inputDataString) => {
    const { totalItems, thresholdValue } = parseInputParameters(inputDataString);

    let accumulatedProbability = 0.0;
    const probabilityPerItem = 1.0 / totalItems;

    for (let currentNumber = 1; currentNumber <= totalItems; currentNumber++) {
        if (currentNumber >= thresholdValue) {
            accumulatedProbability += probabilityPerItem;
        } else {
            let doublingsRequired = 0;
            let currentProductValue = currentNumber;

            while (currentProductValue < thresholdValue) {
                currentProductValue *= 2;
                doublingsRequired++;
            }

            const probabilityOfDoublingSuccess = 1.0 / Math.pow(2, doublingsRequired);
            accumulatedProbability += probabilityPerItem * probabilityOfDoublingSuccess;
        }
    }

    console.log(accumulatedProbability);
};

computeSuccessProbability(require('fs').readFileSync('/dev/stdin', 'utf8'));
