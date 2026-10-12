"use strict";

const calcPermutation = (numItems, numChosen) => {
    let resultVal = 1;
    const iterationLimit = numChosen; 

    for (let currentIdx = 0; currentIdx < iterationLimit; currentIdx++) {
        const currentFactor = numItems - currentIdx; 
        resultVal *= currentFactor;
    }

    return resultVal;
};

const calcCombination = (numItems, numChosen) => {
    const numeratorResult = calcPermutation(numItems, numChosen);
    const denominatorResult = calcPermutation(numChosen, numChosen);
    return numeratorResult / denominatorResult;
};

const processInputAndFindClosest = inputData => {
    const trimmedInput = inputData.trim();
    const inputLines = trimmedInput.split("\n");

    const totalCount = parseInt(inputLines[0], 10); 
    
    const rawNumberStrings = inputLines[1].split(" ");
    const parsedNumbers = rawNumberStrings.map(strNum => parseInt(strNum, 10));
    const sortedDescendingNumbers = parsedNumbers.sort((valA, valB) => valB - valA);

    const maxElement = sortedDescendingNumbers[0];
    const targetHalfValue = maxElement / 2;

    let minimumAbsoluteDifference = Number.POSITIVE_INFINITY;
    let closestElementValue; 

    for (const currentNumber of sortedDescendingNumbers) {
        const currentDifference = Math.abs(targetHalfValue - currentNumber);

        const isCloser = currentDifference < minimumAbsoluteDifference;

        if (isCloser) {
            closestElementValue = currentNumber;
            minimumAbsoluteDifference = currentDifference;
        }
    }
    
    console.log(`${maxElement} ${closestElementValue}`);
};

processInputAndFindClosest(require('fs').readFileSync('/dev/stdin', 'utf8'));
