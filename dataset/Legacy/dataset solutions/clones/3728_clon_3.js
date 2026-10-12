"use strict";

const executeProcessing = inputContent => {
    const trimmedInput = inputContent.trim();
    const inputLines = trimmedInput.split("\n");

    const firstLineData = inputLines[0];
    const firstLineParts = firstLineData.split(" ");
    
    const primaryCount = parseInt(firstLineParts[0], 10);
    const thresholdValue = parseInt(firstLineParts[1], 10);
    
    const rawNumbersString = inputLines[1];
    const numberStringElements = rawNumbersString.split(" ");
    const numericSequence = numberStringElements.map(elementStr => parseInt(elementStr, 10));
    
    const adjustedPrimaryCount = primaryCount - 1;
    const adjustedThresholdValue = thresholdValue - 2;
    
    const calculationNumerator = adjustedPrimaryCount + adjustedThresholdValue;

    const calculationDenominator = thresholdValue - 1;

    const finalComputedResult = calculationNumerator / calculationDenominator;
    
    console.log(finalComputedResult);
};

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
