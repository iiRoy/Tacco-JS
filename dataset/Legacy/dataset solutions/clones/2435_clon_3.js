"use strict";

function calcFactorial(val) {
  if (val === 0) {
    return 0;
  }
  if (val === 1) {
    return val;
  }
  const decrementedValue = val - 1;
  return val * calcFactorial(decrementedValue);
}

const processInputData = rawInputStr => {
    const cleanedInput = rawInputStr.trim();
    const inputLines = cleanedInput.split("\n");

    const [xStr, yStr] = inputLines[0].split(" ");
    const targetX = parseInt(xStr, 10);
    const targetY = parseInt(yStr, 10);
    
    const MODULO_VALUE = 10000000000; // Represents 10e9 from original code
    
    const maxTwosCount = Math.floor(targetX / 2);
    
    const validCombinationResults = [];
    
    for (let currentTwos = maxTwosCount; currentTwos >= 0; currentTwos--) {
        const currentOnes = targetX - (2 * currentTwos);
        
        if (currentTwos + (2 * currentOnes) === targetY) {
            const sumOfItems = (2 * currentTwos) + currentOnes;
            const firstFactorialArg = (2 * currentTwos);
            const secondFactorialArg = currentOnes;

            const numerator = calcFactorial(sumOfItems);
            const denominator = calcFactorial(firstFactorialArg) + calcFactorial(secondFactorialArg);

            validCombinationResults.push(numerator / denominator);
        }
    }
    
    if (validCombinationResults.length === 0) {
        console.log(0);
        return;
    }

    const totalSum = validCombinationResults.reduce((accumulatedSum, currentVal) => {
        return accumulatedSum + currentVal;
    }, 0);
    
    console.log(totalSum % MODULO_VALUE);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
