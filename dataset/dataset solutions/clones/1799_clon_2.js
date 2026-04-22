let rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

let initialElementCount = parseInt(rawInputLines[0], 10);

let dataItemCollection = {};

for (let itemIndex = 0; itemIndex < initialElementCount; itemIndex++) {
    let lineTokens = rawInputLines[1 + itemIndex].split(" ");

    dataItemCollection[itemIndex] = {};

    dataItemCollection[itemIndex][0] = parseInt(lineTokens[0], 10);
    dataItemCollection[itemIndex][1] = parseInt(lineTokens[1], 10);
}

let totalQueryCount = parseInt(rawInputLines[itemIndex++], 10);

let querySpecifications = {};

for (let queryListIndex = 0; queryListIndex < initialElementCount; queryListIndex++) {
    let currentQueryTokens = rawInputLines[1 + itemIndex + queryListIndex].split(" ");

    querySpecifications[queryListIndex] = {};

    querySpecifications[queryListIndex][0] = parseInt(currentQueryTokens[0], 10) - 1;
    querySpecifications[queryListIndex][1] = parseInt(currentQueryTokens[1], 10);
}

for (let currentQueryNum = 0; currentQueryNum < totalQueryCount; currentQueryNum++) {
    let currentNodeId = querySpecifications[currentQueryNum][0];
    let maximumPermittedWeight = querySpecifications[currentQueryNum][1];

    let overallAccumulatedValue = 0;
    let runningWeightTotal = 0;

    for (
        runningWeightTotal = 0;
        runningWeightTotal <= maximumPermittedWeight;
        currentNodeId >>= 1
    ) {
        runningWeightTotal += dataItemCollection[currentNodeId][1];

        if (runningWeightTotal <= maximumPermittedWeight) {
            overallAccumulatedValue += dataItemCollection[currentNodeId][0];
        }

        if (currentNodeId === 0) {
            break;
        }
    }
    console.log(overallAccumulatedValue);
}