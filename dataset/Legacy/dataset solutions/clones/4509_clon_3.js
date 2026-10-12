"use strict";

const calculateFactorialModulo = (valueToFactorial, modulusValue) => {
    let currentAccumulatedProduct = 1;
    for (let iterationIndex = 1; iterationIndex <= valueToFactorial; iterationIndex++) {
        currentAccumulatedProduct = (currentAccumulatedProduct * iterationIndex) % modulusValue;
    }
    return currentAccumulatedProduct;
};

const processInputData = rawInputString => {
    const processedInputLines = rawInputString.trim().split("\n");
    const firstDataLine = processedInputLines[0];
    const [strNumA, strNumB] = firstDataLine.split(" ");

    const countA = parseInt(strNumA, 10);
    const countB = parseInt(strNumB, 10);
    
    const absoluteDifference = Math.abs(countA - countB);
    if (absoluteDifference > 1) {
        console.log(0);
        return;
    }
    
    const modulusConstant = 1000000007;
    
    let combinedFactorialProduct = calculateFactorialModulo(countA, modulusConstant);
    combinedFactorialProduct = (combinedFactorialProduct * calculateFactorialModulo(countB, modulusConstant)) % modulusConstant;
    
    const finalResultMultiplier = (countA === countB) ? 2 : 1;
    
    const finalOutputValue = (combinedFactorialProduct * finalResultMultiplier) % modulusConstant;
    console.log(finalOutputValue);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
