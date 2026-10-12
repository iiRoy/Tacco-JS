"use strict";

const computeGreatestCommonDivisor = (num1, num2) => {
    return num1 ? computeGreatestCommonDivisor(num2 % num1, num1) : num2;
};

const calculateArrayGcd = (numberList) => {
    const listLength = numberList.length;
    let currentGcdValue = numberList[0];
	
    for (let idx = 1; idx < listLength; ++idx) {
        const nextElement = numberList[idx];
        currentGcdValue = computeGreatestCommonDivisor(currentGcdValue, nextElement);
    }

    return currentGcdValue;
};

const determineFinalOutcome = (maximumValue, targetK, arrayGcdResult) => {
    const IMPOSSIBLE_OUTCOME_STRING = "IMPOSSIBLE";
    const POSSIBLE_OUTCOME_STRING = "POSSIBLE";

    if (maximumValue < targetK) {
        return IMPOSSIBLE_OUTCOME_STRING;
    }

    const isTargetKDivisibleByGcd = (targetK % arrayGcdResult === 0);
    return isTargetKDivisibleByGcd ? POSSIBLE_OUTCOME_STRING : IMPOSSIBLE_OUTCOME_STRING;
};

const processInputAndDetermineOutcome = (inputString) => {
    const inputLines = inputString.trim().split("\n");
    
    const firstLineParts = inputLines[0].split(" ");
    const countN = parseInt(firstLineParts[0], 10);
    const targetK = parseInt(firstLineParts[1], 10);
    
    const numberStrings = inputLines[1].split(" ");
    const parsedNumbers = numberStrings.map(str => parseInt(str, 10));
    const numberArray = parsedNumbers.sort((valA, valB) => valB - valA);
    
    const maximumValue = numberArray[0];
    const arrayGcdResult = calculateArrayGcd(numberArray);
    
    const finalResult = determineFinalOutcome(maximumValue, targetK, arrayGcdResult);
    console.log(finalResult);
};

processInputAndDetermineOutcome(require('fs').readFileSync('/dev/stdin', 'utf8'));
