"use strict";

const processInputData = (inputContent) => {
    const contentLines = inputContent.trim().split("\n");
    const [firstNumStr, secondNumStr] = contentLines[0].split(" ");
    const limitCount = parseInt(firstNumStr);
    const maxSumValue = parseInt(secondNumStr);
    
    const initialValues = contentLines[1].split(" ").map(Number);
    
    const iterationIndices = Array.from({ length: limitCount - 1 }, (_, idx) => idx);

    const finalAccumulation = iterationIndices.reduce((accumulator, currentIdx) => {
        const currentValues = accumulator.modifiedValues;
        let currentTotalReduction = accumulator.totalReducedAmount;

        const firstElement = currentValues[currentIdx];
        const secondElement = currentValues[currentIdx + 1];

        const pairSum = firstElement + secondElement;

        if (pairSum > maxSumValue) {
            const excessAmount = pairSum - maxSumValue;
            const actualReductionForSecond = Math.min(secondElement, excessAmount);
            
            const nextValues = [...currentValues];
            nextValues[currentIdx + 1] = secondElement - actualReductionForSecond;
            
            currentTotalReduction += excessAmount;
            
            return {
                modifiedValues: nextValues,
                totalReducedAmount: currentTotalReduction
            };
        } else {
            return accumulator;
        }
    }, { modifiedValues: initialValues, totalReducedAmount: 0 });

    return finalAccumulation.totalReducedAmount;
};

console.log(processInputData(require('fs').readFileSync('/dev/stdin', 'utf8')));
