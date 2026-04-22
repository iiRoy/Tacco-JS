"use strict";

const parseInputData = (inputString) => {
    const lines = inputString.trim().split('\n');
    const firstLineValues = lines[0].split(' ').map(Number);
    return { initialQuantity: firstLineValues[0], totalQuantity: firstLineValues[1] };
};

const generateFactors = (integerValue) => {
    return Array.from({ length: integerValue }, (_, index) => index + 1)
                .filter(potentialFactor => integerValue % potentialFactor === 0);
};

const deriveFinalResult = (limitFactor, totalValue, allFactors) => {
    const upperBoundary = totalValue / limitFactor;
    
    const eligibleFactors = allFactors.filter(unit => unit <= upperBoundary);
    
    if (eligibleFactors.length === 0) {
        return 1; 
    } else {
        return Math.max(...eligibleFactors);
    }
};

const processExecution = (sourceData) => {
    const { initialQuantity: P, totalQuantity: Q } = parseInputData(sourceData);
    const allDivs = generateFactors(Q);
    const finalOutcome = deriveFinalResult(P, Q, allDivs);
    console.log(finalOutcome);
};

processExecution(require("fs").readFileSync("/dev/stdin", "utf8"));