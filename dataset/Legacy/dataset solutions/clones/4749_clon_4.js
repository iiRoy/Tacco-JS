"use strict";

const establishInput = () => {
    const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
    let currentLineIndex = 0;

    const retrieveNextLine = () => {
        if (currentLineIndex >= sourceLines.length) {
            throw "ArrayIndexOutOfBoundsException";
        }
        return sourceLines[currentLineIndex++];
    };

    const retrieveNextInteger = () => parseInt(retrieveNextLine());
    const retrieveNextStringArray = () => retrieveNextLine().split(" ");
    const retrieveNextIntegerArray = () => retrieveNextLine().split(" ").map(el => parseInt(el));
    const retrieveNextCharacterArray = () => retrieveNextLine().split("");
    const hasMoreInput = () => currentLineIndex < sourceLines.length;

    return {
        retrieveNextLine,
        retrieveNextInteger,
        retrieveNextStringArray,
        retrieveNextIntegerArray,
        retrieveNextCharacterArray,
        hasMoreInput
    };
};

const inputSource = establishInput();
const grabLine = () => inputSource.retrieveNextLine();
const grabInt = () => inputSource.retrieveNextInteger();
const grabStrArr = () => inputSource.retrieveNextStringArray();
const grabIntArr = () => inputSource.retrieveNextIntegerArray();
const grabCharArr = () => inputSource.retrieveNextCharacterArray();
const hasMore = () => inputSource.hasMoreInput();

const emitOutput = (...args) => console.log(...args);

const processChallenge = () => {
    const count = grabInt();
    const firstValues = [];
    const secondValues = [];

    while (hasMore()) {
        const currentPair = grabIntArr();
        firstValues.push(currentPair[0]);
        secondValues.push(currentPair[1]);
    }

    const adjustmentValues = new Array(count);

    Array.from({ length: count }, (_, i) => i)
        .reduceRight((currentCumulativeAdjustment, idx) => {
            const targetSum = firstValues[idx] + currentCumulativeAdjustment;
            const divisor = secondValues[idx];

            const requiredMultiplier = Math.max(1, Math.ceil(targetSum / divisor));

            const currentAdjustment = requiredMultiplier * divisor - targetSum;

            adjustmentValues[idx] = currentAdjustment;

            return currentCumulativeAdjustment + currentAdjustment;
        }, 0);

    const totalAdjustment = adjustmentValues.reduce((sum, val) => sum + val, 0);

    emitOutput(totalAdjustment);
};

processChallenge();
