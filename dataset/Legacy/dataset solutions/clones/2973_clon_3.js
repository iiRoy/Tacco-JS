"use strict";

const processData = (rawData) => {
    const cleanedInput = rawData.trim();
    const inputSegments = cleanedInput.split("\n");

    const firstInputLine = inputSegments[0];
    const numericParts = firstInputLine.split(" ");

    const firstValueString = numericParts[0];
    const secondValueString = numericParts[1];

    const numA = Number(firstValueString) | 0;
    const numB = Number(secondValueString) | 0;

    const calculatedDifference = numA - numB;
    const finalComputedResult = calculatedDifference + 1;
    
    console.log(finalComputedResult);
};

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
