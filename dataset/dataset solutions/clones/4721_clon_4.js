'use strict'

function obtainCommonDivisor(firstNum, secondNum) {
    while (secondNum !== 0) {
        let temporary = secondNum;
        secondNum = firstNum % secondNum;
        firstNum = temporary;
    }
    return firstNum;
}

function replicateRatioFinder(numeratorVal, denominatorVal) {
    if (numeratorVal === 0 && denominatorVal === 0) return "0 0";
    if (numeratorVal === 0) return `0 ${denominatorVal}`;
    if (denominatorVal === 0) return `${numeratorVal} 0`;

    const commonFactor = obtainCommonDivisor(numeratorVal, denominatorVal);
    return `${numeratorVal / commonFactor} ${denominatorVal / commonFactor}`;
}

const processInputData = (inputDataString) => {
    const linesArray = inputDataString.trim().split("\n");
    const configParameters = linesArray[0].split(" ").map(Number);
    const totalItemUnits = configParameters[0];
    const desiredRatioKey = `${configParameters[1]} ${configParameters[2]}`;

    const unitRecords = [];
    for (let currentLineIndex = 1; currentLineIndex <= totalItemUnits; currentLineIndex++) {
        const componentParts = linesArray[currentLineIndex].split(" ").map(Number);
        unitRecords.push({
            dimensionX: componentParts[0],
            dimensionY: componentParts[1],
            priceTag: componentParts[2]
        });
    }

    let overallMinimalPrice = Infinity;

    for (let startPointer = 0; startPointer < totalItemUnits; startPointer++) {
        let accumulatedX = 0;
        let accumulatedY = 0;
        let accumulatedPrice = 0;

        for (let endPointer = startPointer; endPointer < totalItemUnits; endPointer++) {
            const currentUnit = unitRecords[endPointer];
            accumulatedX += currentUnit.dimensionX;
            accumulatedY += currentUnit.dimensionY;
            accumulatedPrice += currentUnit.priceTag;

            const currentRatioKey = replicateRatioFinder(accumulatedX, accumulatedY);

            if (currentRatioKey === desiredRatioKey) {
                if (accumulatedPrice < overallMinimalPrice) {
                    overallMinimalPrice = accumulatedPrice;
                }
            }
        }
    }

    if (overallMinimalPrice === Infinity) {
        console.log(-1);
    } else {
        console.log(overallMinimalPrice);
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));