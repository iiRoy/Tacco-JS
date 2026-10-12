"use strict";

const calculateModularFactorial = (numberValue, modulusValue) => {
    if (numberValue === 0) {
        return 1;
    }

    return Array.from({ length: numberValue }, (_, index) => index + 1)
                .reduce((accumulatorProduct, currentNumber) => (accumulatorProduct * currentNumber) % modulusValue, 1);
};

const processInputAndCompute = inputDataString => {
    const processedInputLines = inputDataString.trim().split("\n");
    const countsStrArray = processedInputLines[0].split(" ");

    const firstQuantity = parseInt(countsStrArray[0]);
    const secondQuantity = parseInt(countsStrArray[1]);
    
    if (Math.abs(firstQuantity - secondQuantity) > 1) {
        console.log(0);
        return;
    }
    
    const moduloConstant = 1e9 + 7;
    
    const factorialOfFirst = calculateModularFactorial(firstQuantity, moduloConstant);
    
    const factorialOfSecond = calculateModularFactorial(secondQuantity, moduloConstant);
    
    const finalMultiplier = (firstQuantity === secondQuantity) ? 2 : 1;
    
    const totalPermutations = (factorialOfFirst * factorialOfSecond) % moduloConstant;
    console.log((totalPermutations * finalMultiplier) % moduloConstant);
};

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));
