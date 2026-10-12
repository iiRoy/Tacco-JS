"use strict";

const main = (inputData) => {
    const processedInputLines = inputData.trim().split("\n");
    const countVal = parseInt(processedInputLines[0], 10);
    
    const rawNumberStrings = processedInputLines[1].split(" ");
    const numericArray = rawNumberStrings.map(strNum => parseInt(strNum, 10));
    
    const diffList = [];
    
    for (let idx = 0; idx < numericArray.length; idx++) {
        const currentArrayElement = numericArray[idx];
        const oneBasedIndex = idx + 1;
        const calculatedDifference = currentArrayElement - oneBasedIndex;
        
        diffList.push(calculatedDifference);
    }
    
    const uniqueDiffs = new Set(diffList);
    
    let totalAbsoluteSum = 0;
    for (const uniqueValue of uniqueDiffs) {
        totalAbsoluteSum += Math.abs(uniqueValue);
    }
    
    console.log(totalAbsoluteSum);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
