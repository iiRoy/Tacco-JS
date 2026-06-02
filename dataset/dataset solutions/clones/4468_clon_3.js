"use strict";

const calculateArrayGCD = inputNumbers => {
  const count = inputNumbers.length;
  
  let currentGCD = inputNumbers[0];
	
  for (let i = 1; i < count; ++i) {
		const nextNumber = inputNumbers[i];
		currentGCD = computeGCD(currentGCD, nextNumber);
	}

	return currentGCD;
};

const computeGCD = (firstNum, secondNum) => {
    const remainder = secondNum % firstNum;
    return firstNum ? computeGCD(remainder, firstNum) : secondNum;
};

const processInputAndSolve = inputData => {
    const lines = inputData.trim().split("\n");
    
    const firstLineParts = lines[0].split(" ");
    const numElements = parseInt(firstLineParts[0], 10);
    const targetValue = parseInt(firstLineParts[1], 10);
    
    const rawNumberStringsArray = lines[1].split(" ");
    
    const numberList = rawNumberStringsArray.map(str => parseInt(str, 10))
                                       .sort((valA, valB) => valB - valA);
    
    const maximumValue = numberList[0];
    const computedGCD = calculateArrayGCD(numberList);
    
    if (maximumValue < targetValue) {
        console.log("IMPOSSIBLE");
        return;
    }
    
    const isTargetReachable = (targetValue % computedGCD === 0);
    
    console.log(isTargetReachable ? "POSSIBLE" : "IMPOSSIBLE");
};

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
