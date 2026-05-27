"use strict";

const processInput = (rawInputString) => {
    const processedLines = rawInputString.trim().split("\n");

    const firstLineData = processedLines[0].split(" ");
    const elementCount = parseInt(firstLineData[0], 10);
    const maxAllowedSum = parseInt(firstLineData[1], 10);

    const secondLineData = processedLines[1].split(" ");
    const valueArray = secondLineData.map(numericString => parseInt(numericString, 10));

    let totalReductionAmount = 0;

    for (let currentIndex = 0; currentIndex < elementCount - 1; currentIndex++) {
        const subsequentIndex = currentIndex + 1;
        const currentPairValue = valueArray[currentIndex] + valueArray[subsequentIndex];

        if (currentPairValue > maxAllowedSum) {
            const excessAmount = currentPairValue - maxAllowedSum;
            
            let nextElementOriginalValue = valueArray[subsequentIndex];
            let nextElementReducedValue = nextElementOriginalValue - excessAmount;
            
            valueArray[subsequentIndex] = Math.max(0, nextElementReducedValue);
            
            totalReductionAmount += excessAmount;
        }
    }

    console.log(totalReductionAmount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
