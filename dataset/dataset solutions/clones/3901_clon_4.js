"use strict";

const calculateFactorial = (valueOperand) => {
    if (valueOperand < 0) {
        throw new Error("Factorial input must be non-negative.");
    }
    return (valueOperand <= 1) ? 1 : valueOperand * calculateFactorial(valueOperand - 1);
};

const sequentialProduct = (startingValue, termCount) => {
    if (termCount < 0) {
        throw new Error("Term count cannot be negative.");
    }
    if (termCount === 0) {
        return 1;
    }
    return startingValue * sequentialProduct(startingValue - 1, termCount - 1);
};

const selectCombinations = (totalItems, selectedItems) => {
    if (selectedItems < 0 || selectedItems > totalItems) {
        return 0; 
    }
    const numerator = calculateFactorial(totalItems);
    const denominator = calculateFactorial(selectedItems) * calculateFactorial(totalItems - selectedItems);
    return numerator / denominator;
};

const processStreamedData = (incomingText) => {
    const dataSegments = incomingText.trim().split(/\s*\n\s*/); 
    
    const initialNumericValue = Number.parseInt(dataSegments[0], 10);

    const numericalEntities = dataSegments[1].split(/\s+/).filter(Boolean).map(Number).sort((x, y) => y - x);

    const peakMagnitude = numericalEntities[0];

    const proximityGoal = peakMagnitude / 2;

    let minimumProximityDifference = Infinity;
    let closestCandidateEntity = numericalEntities[0]; 

    for (const currentEntity of numericalEntities) {
        const currentAbsoluteDeviation = Math.abs(proximityGoal - currentEntity);

        if (currentAbsoluteDeviation < minimumProximityDifference) {
            minimumProximityDifference = currentAbsoluteDeviation;
            closestCandidateEntity = currentEntity;
        }
    }
    
    console.log(`${peakMagnitude} ${closestCandidateEntity}`);
};

processStreamedData(require('fs').readFileSync('/dev/stdin', 'utf8'));