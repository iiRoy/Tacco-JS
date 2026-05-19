"use strict";

const processInput = rawInputContent => {
    const inputLines = rawInputContent.trim().split("\n");
    const firstLineTokens = inputLines[0].split(" ");

    const upperBound = parseInt(firstLineTokens[0]);
    const thresholdValue = parseInt(firstLineTokens[1]);
    
    let cumulativeSum = 0;
    
    const ZERO_THRESHOLD = 0;
    if (thresholdValue === ZERO_THRESHOLD) {
        const squaredBound = upperBound * upperBound;
        console.log(squaredBound);
        return;
    }
    
    for (let currentDivisor = 1; currentDivisor <= upperBound; currentDivisor++) {
        const quotientPart = Math.floor(upperBound / currentDivisor);
        const remainderPart = upperBound % currentDivisor;
        
        const firstTermFactor = currentDivisor - thresholdValue;
        if (firstTermFactor > 0) {
            cumulativeSum += quotientPart * firstTermFactor;
        }
        
        if (remainderPart > 0) {
            const secondTermValue = remainderPart - thresholdValue + 1;
            if (secondTermValue > 0) {
                cumulativeSum += secondTermValue;
            }
        }
    }
    
    console.log(cumulativeSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
