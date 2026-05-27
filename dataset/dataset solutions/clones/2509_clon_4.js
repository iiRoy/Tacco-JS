"use strict";

const computeCostA = (initialChars) => {
    if (initialChars.length <= 1) {
        return 0;
    }

    const recursiveCostCalculation = (currentIndex, currentAccumulatedCost, currentStringArr) => {
        if (currentIndex >= initialChars.length - 1) {
            return currentAccumulatedCost;
        }

        let nextAccumulatedCost = currentAccumulatedCost;
        let nextStringArr = [...currentStringArr];

        if (nextStringArr[currentIndex] === nextStringArr[currentIndex + 1]) {
            nextAccumulatedCost++;
            if (currentIndex === initialChars.length - 2) {
                nextStringArr[currentIndex + 1] = '|';
            } else {
                if (currentIndex !== 0) {
                    nextStringArr[currentIndex + 1] = '*';
                } else {
                    nextStringArr[currentIndex] = '*';
                }
            }
        }
        return recursiveCostCalculation(currentIndex + 1, nextAccumulatedCost, nextStringArr);
    };

    return recursiveCostCalculation(0, 0, [...initialChars]);
};

const computeCostB = (initialChars) => {
    if (initialChars.length <= 1) {
        return 0;
    }

    let workingCharsState = [...initialChars];
    let initialAccumulatedCost = 0;

    const firstOriginalChar = initialChars[0];
    const lastOriginalChar = initialChars[initialChars.length - 1];

    if (firstOriginalChar === lastOriginalChar) {
        workingCharsState[0] = '@';
        workingCharsState[workingCharsState.length - 1] = '@';
        initialAccumulatedCost = 2;
    }

    const recursiveInnerLoop = (currentIndex, currentAccumulatedCost, currentStringArr) => {
        if (currentIndex >= currentStringArr.length - 1) {
            return currentAccumulatedCost;
        }

        let nextAccumulatedCost = currentAccumulatedCost;
        let nextStringArr = [...currentStringArr];

        if (nextStringArr[currentIndex] === nextStringArr[currentIndex + 1]) {
            nextAccumulatedCost++;
            nextStringArr[currentIndex + 1] = '?';
        }
        return recursiveInnerLoop(currentIndex + 1, nextAccumulatedCost, nextStringArr);
    };

    return recursiveInnerLoop(0, initialAccumulatedCost, workingCharsState);
};

const processInputData = (inputRaw) => {
    inputRaw = inputRaw.trim().split("\n");
    const inputStringCharacters = inputRaw[0].split("");
    const repetitionCount = parseInt(inputRaw[1]);

    if (inputStringCharacters.length === 1) {
        console.log(Math.floor(repetitionCount / 2));
        return;
    }

    const calculatedCostA = computeCostA(inputStringCharacters);
    const calculatedCostB = computeCostB(inputStringCharacters);

    let finalCalculatedResult = 0;

    if (repetitionCount % 2 === 0) {
        finalCalculatedResult = (calculatedCostA + calculatedCostB) * (repetitionCount / 2);
    } else {
        finalCalculatedResult = (calculatedCostA * Math.ceil(repetitionCount / 2)) + (calculatedCostB * Math.floor(repetitionCount / 2));
    }

    console.log(finalCalculatedResult);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
