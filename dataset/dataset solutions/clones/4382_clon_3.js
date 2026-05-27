"use strict";

const processInputAndSolve = (rawInputString) => {
    const trimmedInput = rawInputString.trim();
    const inputLines = trimmedInput.split("\n");

    const totalElementsCount = parseInt(inputLines[0], 10);
    const numericArray = inputLines[1].split(" ").map(val => parseInt(val, 10));

    const sortedNumericArray = numericArray.sort((valA, valB) => valA - valB);

    const uniqueValuesSet = new Set(sortedNumericArray);
    const distinctSortedValues = Array.from(uniqueValuesSet);

    let highestFrequency = 0;

    const updateMaxFrequency = (currentMax, newCandidate) => {
        return Math.max(currentMax, newCandidate);
    };

    for (const currentDistinctValue of distinctSortedValues) {
        let currentFrequency = 0;

        const lowerBound = currentDistinctValue - 1;
        const upperBound = currentDistinctValue + 1;

        for (let numIndex = 0; numIndex < totalElementsCount; numIndex++) {
            const currentNumberInArray = sortedNumericArray[numIndex];

            if (currentNumberInArray >= lowerBound && currentNumberInArray <= upperBound) {
                currentFrequency++;
            }
        }

        highestFrequency = updateMaxFrequency(highestFrequency, currentFrequency);
    }

    console.log(highestFrequency);
};

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
