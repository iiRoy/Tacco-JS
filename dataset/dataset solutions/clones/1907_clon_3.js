"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenCursor = 0;

var operationResult = executeProcessing();
if (operationResult !== undefined) console.log(operationResult);

function executeProcessing() {
    const parseNumericValue = (inputString) => {
        const parsed = Number(inputString);
        return parsed;
    };

    const firstElementStr = tokenStream.shift();
    const countElements = parseNumericValue(firstElementStr);

    const sumMap = new Map();
    const diffMap = new Map();

    const streamLength = tokenStream.length;
    for (let currentIndex = 0; currentIndex < streamLength; ++currentIndex) {
        const currentToken = tokenStream[currentIndex];
        const numericVal = parseNumericValue(currentToken);

        const sumKey = String(currentIndex + numericVal);
        const diffKey = String(currentIndex - numericVal);

        const existingSumCount = sumMap.get(sumKey) || 0;
        sumMap.set(sumKey, existingSumCount + 1);

        const existingDiffCount = diffMap.get(diffKey) || 0;
        diffMap.set(diffKey, existingDiffCount + 1);
    }

    let finalCount = 0;

    const sumKeysIterator = sumMap.keys();
    for (const keyIdentifier of sumKeysIterator) {
        const sumValue = sumMap.get(keyIdentifier);
        const diffValue = diffMap.get(keyIdentifier);

        if (diffValue !== undefined) {
            const productOfCounts = sumValue * diffValue;
            finalCount += productOfCounts;
        }
    }

    return finalCount;
}
