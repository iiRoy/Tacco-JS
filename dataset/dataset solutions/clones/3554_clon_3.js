'use strict';

const parseNumericString = (str) => Number(str);

function processInput(rawData) {
    const inputLines = rawData.split('\n');

    const firstLineParts = inputLines[0].split(' ');
    const countOfNumbers = parseNumericString(firstLineParts[0]);
    const targetValue = parseNumericString(firstLineParts[1]);

    const numberStrings = inputLines[1].split(' ');

    const absoluteDifferences = [];
    for (const numStr of numberStrings) {
        const currentNumber = parseNumericString(numStr);
        const differenceFromTarget = currentNumber - targetValue;
        const absDifference = Math.abs(differenceFromTarget);
        absoluteDifferences.push(absDifference);
    }

    absoluteDifferences.sort((valA, valB) => valA - valB);

    const calculateGCD = (valA, valB) => {
        return valB === 0 ? valA : calculateGCD(valB, valA % valB);
    };

    let finalResultGCD;

    if (absoluteDifferences.length === 1) {
        finalResultGCD = absoluteDifferences[0];
    } else {
        finalResultGCD = absoluteDifferences[0];
        for (let i = 1; i < countOfNumbers; i++) {
            finalResultGCD = calculateGCD(finalResultGCD, absoluteDifferences[i]);
        }
    }

    console.log(finalResultGCD);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
