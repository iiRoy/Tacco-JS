"use strict";

const processingUnit = (rawInput) => {
    const dataLines = rawInput.trim().split('\n');
    const numericParameters = dataLines[0].split(' ').map(Number);
    
    const valueA = numericParameters[0];
    const valueB = numericParameters[1];
    
    if (valueB === 0) {
        console.log(valueA * valueA);
        return;
    }
    
    let exclusionTally = 0;
    
    for (let currentDivisor = 1; currentDivisor <= valueA; ++currentDivisor) {
        const fullCycles = Math.floor(valueA / currentDivisor);
        const remainingElements = valueA % currentDivisor;
        
        exclusionTally += fullCycles * Math.min(valueB, currentDivisor);
        
        if (remainingElements > 0) {
            exclusionTally += Math.max(0, Math.min(remainingElements, valueB - 1));
        }
    }
    
    const finalOutcome = (valueA * valueA) - exclusionTally;
    console.log(finalOutcome);
};

const initiateCalculation = (externalData) => {
    processingUnit(externalData);
};

initiateCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));