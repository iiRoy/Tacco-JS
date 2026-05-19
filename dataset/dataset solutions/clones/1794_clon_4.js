"use strict";

function* createTokenStream(sourceText) {
    const tokens = sourceText.split(/ |\n/).filter(Boolean);
    let currentPosition = 0;
    while (currentPosition < tokens.length) {
        yield tokens[currentPosition++];
    }
}

const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataStream = createTokenStream(sourceData);

function fetchNumber() {
    return +dataStream.next().value;
}

function fetchString() {
    return dataStream.next().value;
}

function fetchBigNumber() {
    return BigInt(dataStream.next().value);
}

function fetchNumberSequence(count) {
    return Array.from({ length: count }, () => fetchNumber());
}

function fetchBigNumberSequence(count) {
    return Array.from({ length: count }, () => fetchBigNumber());
}

function fetchGrid(rows, columns, stringMode) {
    const gridResult = [];
    for (let r = 0; r < rows; r++) {
        const rowData = [];
        for (let c = 0; c < columns; c++) {
            rowData.push(stringMode ? fetchString() : fetchNumber());
        }
        gridResult.push(rowData);
    }
    return gridResult;
}

console.log(processIllumination());

function processIllumination() {
    const totalElements = fetchNumber();
    const maxIterations = fetchNumber();
    let currentLightConfiguration = fetchNumberSequence(totalElements);
    let nextLightConfiguration;
    let iterationCounter;
    let minimumLevelSnapshot;

    for (iterationCounter = 0; iterationCounter < maxIterations; iterationCounter++) {
        nextLightConfiguration = Array(totalElements).fill(0);
        minimumLevelSnapshot = iterationCounter;

        for (let lightSourceIndex = 0; lightSourceIndex < totalElements; lightSourceIndex++) {
            const lightPower = currentLightConfiguration[lightSourceIndex];
            const illuminationStartPoint = Math.max(0, lightSourceIndex - lightPower);
            const illuminationEndPoint = Math.min(totalElements - 1, lightSourceIndex + lightPower);

            const temporaryContribution = Array(totalElements).fill(0);
            temporaryContribution.fill(1, illuminationStartPoint, illuminationEndPoint + 1);
            
            nextLightConfiguration = nextLightConfiguration.map((currentValue, index) => currentValue + temporaryContribution[index]);

            minimumLevelSnapshot = Math.min(minimumLevelSnapshot, nextLightConfiguration[lightSourceIndex]);
        }

        currentLightConfiguration = nextLightConfiguration;

        if (iterationCounter > 41 && minimumLevelSnapshot >= totalElements) {
            break;
        }
    }

    return currentLightConfiguration.join(" ");
}
