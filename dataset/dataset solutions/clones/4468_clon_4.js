"use strict";

const computeDivisor = (num1, num2) => {
    while (num2) {
        [num1, num2] = [num2, num1 % num2];
    }
    return num1;
};

const aggregateDivisor = inputNumbers => {
    if (inputNumbers.length === 0) {
        return 0; // Or handle error, but original assumes non-empty array
    }
    return inputNumbers.reduce((currentAccumulator, nextValue) =>
        computeDivisor(currentAccumulator, nextValue)
    );
};

const processInput = rawInput => {
    const lines = rawInput.trim().split("\n");
    const [countElements, targetVal] = lines[0].split(" ").map(Number);
    
    const parsedNumbers = lines[1].split(" ").map(Number);
    
    const maxVal = Math.max(...parsedNumbers);
    const commonDivisor = aggregateDivisor(parsedNumbers);
    
    let outcomeMessage;
    if (maxVal < targetVal) {
        outcomeMessage = "IMPOSSIBLE";
    } else {
        outcomeMessage = (targetVal % commonDivisor === 0) ? "POSSIBLE" : "IMPOSSIBLE";
    }
    
    console.log(outcomeMessage);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
