"use strict";

const calculateArrangement = (totalItems, selectedItems) => {
    if (selectedItems === 0) {
        return 1;
    }
    return totalItems * calculateArrangement(totalItems - 1, selectedItems - 1);
};

const computeSelection = (totalItems, selectedItems) => {
    const calculateFactorial = (numValue) => {
        if (numValue < 0) return 0;
        if (numValue === 0) return 1;
        return numValue * calculateFactorial(numValue - 1);
    };
    return calculateFactorial(totalItems) / (calculateFactorial(selectedItems) * calculateFactorial(totalItems - selectedItems));
};

const processInputData = (inputContent) => {
    const contentLines = inputContent.trim().split("\n");
    const totalCount = Number(contentLines[0]);
    const numericValues = contentLines[1].split(" ").map(Number);
    
    const descendingSortedValues = numericValues.sort((valA, valB) => valB - valA);

    const primaryValue = descendingSortedValues[0];
    const comparisonMidpoint = primaryValue / 2;

    const nearestElement = descendingSortedValues.reduce((currentBest, currentItem) => {
        const currentDifference = Math.abs(comparisonMidpoint - currentItem);
        const bestDifference = Math.abs(comparisonMidpoint - currentBest);

        if (currentDifference < bestDifference) {
            return currentItem;
        } else if (currentDifference === bestDifference) {
            return currentBest;
        } else {
            return currentBest;
        }
    }, descendingSortedValues[0]);
    
    console.log(primaryValue + " " + nearestElement);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
