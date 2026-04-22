"use strict";

const processValuation = (sourceData) => {
    const numericElements = sourceData.split(/\s+/).filter(Boolean).map(item => Number(item));

    const unitCostAlpha = numericElements[0];
    const unitCostBeta = numericElements[1];
    const unitCostCombined = numericElements[2];
    const requiredAlpha = numericElements[3];
    const requiredBeta = numericElements[4];

    const maximumCombinedUnits = 2 * Math.max(requiredAlpha, requiredBeta);

    const sequenceOfCombinedUnits = Array.from(
        { length: maximumCombinedUnits / 2 + 1 },
        (_, index) => index * 2
    );

    const calculatedCosts = sequenceOfCombinedUnits.map(currentCombinedAmount => {
        const remainingAlphaUnits = Math.max(0, requiredAlpha - currentCombinedAmount / 2);
        const remainingBetaUnits = Math.max(0, requiredBeta - currentCombinedAmount / 2);

        return (
            currentCombinedAmount * unitCostCombined +
            remainingAlphaUnits * unitCostAlpha +
            remainingBetaUnits * unitCostBeta
        );
    });

    const lowestTotalCost = Math.min(...calculatedCosts);

    return lowestTotalCost;
};

const executeComputation = () => {
    const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8");
    const resultValue = processValuation(inputPayload);
    console.log(resultValue);
};

executeComputation();