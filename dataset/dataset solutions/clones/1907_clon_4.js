"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = fileContent.split(/ |\n/);
let tokenIndex = 0;

const getNextNumericToken = () => {
    if (tokenIndex >= tokenStream.length) {
        return undefined;
    }
    return +tokenStream[tokenIndex++];
};

const calculatePairCounts = () => {
    const initialValue = getNextNumericToken();
    if (initialValue === undefined) {
        return 0;
    }

    const subsequentNumbers = [];
    let currentNumber;
    while ((currentNumber = getNextNumericToken()) !== undefined) {
        subsequentNumbers.push(currentNumber);
    }

    const aggregatedCounts = subsequentNumbers.reduce((accumulatorMap, val, idx) => {
        const sumKey = idx + val;
        const diffKey = idx - val;

        const sumEntry = accumulatorMap.get(sumKey) || { plus: 0, minus: 0 };
        sumEntry.plus++;
        accumulatorMap.set(sumKey, sumEntry);

        const diffEntry = accumulatorMap.get(diffKey) || { plus: 0, minus: 0 };
        diffEntry.minus++;
        accumulatorMap.set(diffKey, diffEntry);

        return accumulatorMap;
    }, new Map());

    const finalAnswer = Array.from(aggregatedCounts.values()).reduce((total, { plus, minus }) => {
        return total + (plus * minus);
    }, 0);

    return finalAnswer;
};

const programOutput = calculatePairCounts();
if (programOutput !== undefined) {
    console.log(programOutput);
}
