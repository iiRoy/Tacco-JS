"use strict";

const readStdinContent = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseFirstLineData = (lineContent) => {
    const parts = lineContent.split(" ");
    return {
        elementCount: parseInt(parts[0]),
        maximumAllowedSum: parseInt(parts[1])
    };
};

const parseNumericArray = (lineContent) => {
    return lineContent.split(" ").map(strNum => parseInt(strNum));
};

const processInputData = (rawInputString) => {
    const cleanedInput = rawInputString.trim();
    const inputLines = cleanedInput.split("\n");

    const { elementCount: arraySize, maximumAllowedSum: sumLimit } = parseFirstLineData(inputLines[0]);
    
    const dataNumbers = parseNumericArray(inputLines[1]);
    
    let totalModifications = 0;
    
    const iterationLimit = arraySize - 1;

    for (let currentIdx = 0; currentIdx < iterationLimit; ++currentIdx) {
        const firstValue = dataNumbers[currentIdx];
        const secondValue = dataNumbers[currentIdx + 1];
        
        const pairSum = firstValue + secondValue;
        
        if (pairSum > sumLimit) {
            const excessAmount = pairSum - sumLimit;
            
            dataNumbers[currentIdx + 1] -= excessAmount;
            totalModifications += excessAmount;
        }
    }
    
    console.log(totalModifications);
};

processInputData(readStdinContent());
