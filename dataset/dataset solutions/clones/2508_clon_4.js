"use strict";
const processInputData = require("fs").readFileSync("/dev/stdin", "utf8");
let lineCollection = processInputData.trim().split("\n");
let currentReadPointer = 0;

const extractNextToken = () => {
    if (typeof lineCollection[currentReadPointer] === 'string') {
        lineCollection[currentReadPointer] = lineCollection[currentReadPointer].split(" ").reverse();
    }
    const tokenArray = lineCollection[currentReadPointer];
    const numericValue = parseInt(tokenArray.pop(), 10);
    if (tokenArray.length === 0) {
        currentReadPointer++;
    }
    return numericValue;
};

const acquireLineValues = () => {
    const rawLine = lineCollection[currentReadPointer++];
    return rawLine.split(" ").map(Number);
};

const performCalculation = () => {
    const overallItemCount = extractNextToken();
    const itemIdentifierList = acquireLineValues();

    const frequencyRegistry = new Map();
    for (const singleIdentifier of itemIdentifierList) {
        frequencyRegistry.set(singleIdentifier - 1, (frequencyRegistry.get(singleIdentifier - 1) || 0) + 1);
    }

    const descendingFrequencies = Array.from(frequencyRegistry.values()).sort((valA, valB) => valB - valA);

    const outcomeSequence = [overallItemCount];

    for (let groupCount = 2; groupCount <= overallItemCount; groupCount++) {
        if (descendingFrequencies.length < groupCount) {
            outcomeSequence.push(0);
        } else {
            const initialGroupFloor = Math.floor(overallItemCount / groupCount);

            const adjustedTotalItems = descendingFrequencies.reduce((accumulator, currentFrequency) => {
                if (currentFrequency > initialGroupFloor) {
                    return accumulator - (currentFrequency - initialGroupFloor);
                }
                return accumulator;
            }, overallItemCount);

            const finalGroupFloor = Math.floor(adjustedTotalItems / groupCount);
            outcomeSequence.push(finalGroupFloor);
        }
    }
    return outcomeSequence.join("\n");
};

console.log(performCalculation());