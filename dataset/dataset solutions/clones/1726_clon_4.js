"use strict"
const acquireDataStream = () => require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

let dataLines = acquireDataStream();
let currentLineIndex = 0;

const retrieveLine = () => {
    if (currentLineIndex >= dataLines.length) {
        throw new Error("Input stream exhausted");
    }
    return dataLines[currentLineIndex++];
};

const retrieveNumeric = () => parseInt(retrieveLine());
const retrieveNumericSequence = () => retrieveLine().split(" ").map(Number);
const retrieveTextSequence = () => retrieveLine().split(" ");
const retrieveCharSequence = () => retrieveLine().split("");

const publishResult = (...values) => console.log(...values);

const findGreatestIndexBelowOrEqual = (sortedArray, target) => {
    let lowBoundary = 0;
    let highBoundary = sortedArray.length - 1;
    let optimalIndex = 0;

    while (lowBoundary <= highBoundary) {
        const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
        if (sortedArray[midPoint] <= target) {
            optimalIndex = midPoint;
            lowBoundary = midPoint + 1;
        } else {
            highBoundary = midPoint - 1;
        }
    }
    return optimalIndex;
};

const orchestrateProcess = () => {
    const [alphaLen, betaLen, budgetConstraint] = retrieveNumericSequence();
    const alphaSequence = retrieveNumericSequence();
    const betaSequence = retrieveNumericSequence();

    const alphaCumulative = alphaSequence.reduce((accumulator, currentValue) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentValue);
        return accumulator;
    }, [0]);

    const betaCumulative = betaSequence.reduce((accumulator, currentValue) => {
        accumulator.push(accumulator[accumulator.length - 1] + currentValue);
        return accumulator;
    }, [0]);

    let maximumAchieved = 0;

    for (let j = 0; j <= betaLen; j++) {
        const currentBetaCost = betaCumulative[j];
        const remainingBudget = budgetConstraint - currentBetaCost;

        if (remainingBudget < 0) {
            break;
        }
        
        const i_alpha = findGreatestIndexBelowOrEqual(alphaCumulative, remainingBudget);
        
        maximumAchieved = Math.max(maximumAchieved, i_alpha + j);
    }

    publishResult(maximumAchieved);
};

orchestrateProcess();