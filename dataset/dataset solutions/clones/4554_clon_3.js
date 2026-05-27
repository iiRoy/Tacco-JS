"use strict";

const parseNumericValues = (lineContent) => {
    return lineContent.split(" ").map(Number);
};

const determineResultCount = (numElements, valA, valB) => {
    if (valA > valB) {
        return 0;
    }

    if (numElements === 1) {
        return valA === valB ? 1 : 0;
    }

    const elementsMinusOne = numElements - 1;

    const highestPossibleSum = valA + (valB * elementsMinusOne);
    const lowestPossibleSum = valB + (valA * elementsMinusOne);

    const count = highestPossibleSum - lowestPossibleSum + 1;
    return count;
};

const processInput = (rawInput) => {
    const trimmedInput = rawInput.trim();
    const firstLine = trimmedInput.split("\n")[0];

    const [numElements, valA, valB] = parseNumericValues(firstLine);

    const finalResult = determineResultCount(numElements, valA, valB);

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
