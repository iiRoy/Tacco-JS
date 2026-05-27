var inputDataLines = [];
var gridDimensionN, pairCountM, queryCountQ;
var prefixSumMatrix;

var ioModule = require('readline');

var inputOutputInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputOutputInterface.on('line', function (currentInputLine) {
    inputDataLines.push(currentInputLine);
});

inputOutputInterface.on('close', function () {
    const parseInitialParameters = (lineContent) => {
        const tokens = lineContent.split(" ");
        return {
            nValue: Number(tokens[0]),
            mValue: Number(tokens[1]),
            qValue: Number(tokens[2])
        };
    };

    const initialParameters = parseInitialParameters(inputDataLines[0]);
    gridDimensionN = initialParameters.nValue;
    pairCountM = initialParameters.mValue;
    queryCountQ = initialParameters.qValue;

    prefixSumMatrix = Array.from({ length: gridDimensionN + 1 }, () => Array(gridDimensionN + 1).fill(0));

    const leftCoordinates = Array.from({ length: pairCountM }, (_, loopIndexA) => {
        const splitLineTokens = inputDataLines[loopIndexA + 1].split(" ");
        return Number(splitLineTokens[0]);
    });
    const rightCoordinates = Array.from({ length: pairCountM }, (_, loopIndexA) => {
        const splitLineTokens = inputDataLines[loopIndexA + 1].split(" ");
        return Number(splitLineTokens[1]);
    });

    const queryStartPoints = Array.from({ length: queryCountQ }, (_, loopIndexA) => {
        const splitLineTokens = inputDataLines[loopIndexA + pairCountM + 1].split(" ");
        return Number(splitLineTokens[0]);
    });
    const queryEndPoints = Array.from({ length: queryCountQ }, (_, loopIndexA) => {
        const splitLineTokens = inputDataLines[loopIndexA + pairCountM + 1].split(" ");
        return Number(splitLineTokens[1]);
    });

    populatePrefixSumMatrix(leftCoordinates, rightCoordinates, gridDimensionN, pairCountM);

    for (let loopIndexA = 0; loopIndexA < queryCountQ; loopIndexA++) {
        const currentQueryStart = queryStartPoints[loopIndexA];
        const currentQueryEnd = queryEndPoints[loopIndexA];

        const totalAreaSum = prefixSumMatrix[currentQueryEnd][currentQueryEnd];
        const topExcludedSum = prefixSumMatrix[currentQueryEnd][currentQueryStart - 1];
        const leftExcludedSum = prefixSumMatrix[currentQueryStart - 1][currentQueryEnd];
        const overlapIncludedSum = prefixSumMatrix[currentQueryStart - 1][currentQueryStart - 1];

        const calculatedResult = totalAreaSum - topExcludedSum - leftExcludedSum + overlapIncludedSum;
        console.log(calculatedResult);
    }
});

function populatePrefixSumMatrix(leftCoords, rightCoords, dimensionN, numPairs) {
    for (let loopIndexA = 0; loopIndexA < numPairs; loopIndexA++) {
        const currentLeftCoord = leftCoords[loopIndexA];
        const currentRightCoord = rightCoords[loopIndexA];
        prefixSumMatrix[currentLeftCoord][currentRightCoord]++;
    }

    for (let loopIndexA = 1; loopIndexA <= dimensionN; loopIndexA++) {
        for (let loopIndexB = 1; loopIndexB <= dimensionN; loopIndexB++) {
            let cellValue = prefixSumMatrix[loopIndexA][loopIndexB];
            let valueFromAbove = prefixSumMatrix[loopIndexA - 1][loopIndexB];
            let valueFromLeft = prefixSumMatrix[loopIndexA][loopIndexB - 1];
            let valueFromOverlap = prefixSumMatrix[loopIndexA - 1][loopIndexB - 1];

            prefixSumMatrix[loopIndexA][loopIndexB] = cellValue + valueFromAbove + valueFromLeft - valueFromOverlap;
        }
    }
}
