"use strict";

const determineCombinations = (initialInput) => {
    const numericValues = initialInput.trim().split('\n').map(val => parseInt(val, 10));

    const maxCountA = numericValues[0];
    const maxCountB = numericValues[1];
    const maxCountC = numericValues[2];
    const targetAmount = numericValues[3];

    const denominations = [500, 100, 50];
    const limits = [maxCountA, maxCountB, maxCountC];

    const recursiveSolver = (
        currentDenominationIndex,
        remainingValue
    ) => {
        if (currentDenominationIndex === denominations.length) {
            return remainingValue === 0 ? 1 : 0;
        }

        if (remainingValue < 0) {
            return 0;
        }

        let totalValidWays = 0;
        const currentDenomination = denominations[currentDenominationIndex];
        const maximumUnits = limits[currentDenominationIndex];

        for (let unitCount = 0; unitCount <= maximumUnits; ++unitCount) {
            const valueFromUnits = unitCount * currentDenomination;
            if (valueFromUnits > remainingValue) {
                break;
            }

            totalValidWays += recursiveSolver(
                currentDenominationIndex + 1,
                remainingValue - valueFromUnits
            );
        }
        return totalValidWays;
    };

    return recursiveSolver(0, targetAmount);
};

const processInput = (sourceReader) => {
    const rawData = sourceReader.readFileSync('/dev/stdin', 'utf8');
    const result = determineCombinations(rawData);
    console.log(result);
};

processInput(require('fs'));