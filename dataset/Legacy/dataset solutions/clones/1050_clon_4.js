"use strict";

const processQueries = (countN, sourceNumbers, countQ, queryNumbers) => {
    const reachableSums = new Set();

    const buildSums = (currentIdx, accumulatedVal) => {
        if (currentIdx === countN) {
            if (accumulatedVal !== 0) {
                reachableSums.add(accumulatedVal);
            }
            return;
        }

        buildSums(currentIdx + 1, accumulatedVal + sourceNumbers[currentIdx]);
        buildSums(currentIdx + 1, accumulatedVal);
    };

    buildSums(0, 0);

    const queryOutcomes = queryNumbers.map(targetVal => {
        return reachableSums.has(targetVal) ? "yes" : "no";
    });

    return queryOutcomes;
};

const inputData = {
    lineCounter: 0,
    numElements: 0,
    elementValues: null,
    numQueries: 0,
    queryValues: null
};

const inputProcessor = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputProcessor.on("line", (currentLine) => {
    inputData.lineCounter++;

    switch (inputData.lineCounter) {
        case 1:
            inputData.numElements = Number(currentLine);
            break;
        case 2:
            inputData.elementValues = currentLine.trim().split(" ").map(val => Number(val));
            break;
        case 3:
            inputData.numQueries = Number(currentLine);
            break;
        case 4:
            inputData.queryValues = currentLine.trim().split(" ").map(val => Number(val));
            const finalResults = processQueries(
                inputData.numElements,
                inputData.elementValues,
                inputData.numQueries,
                inputData.queryValues
            );
            finalResults.forEach(res => console.log(res));
            process.exit(0);
            break;
    }
});
