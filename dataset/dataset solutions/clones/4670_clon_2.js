let inputBuffer = [];
const lineReaderModule = require('readline');

const interfaceInstance = lineReaderModule.createInterface({
    input:  process.stdin,
    output: process.stdout,
});

interfaceInstance.on('line', function(currentLine) {
    inputBuffer.push(currentLine);
});

interfaceInstance.on('close', function() {
    let firstInputLine = inputBuffer.shift();

    const totalElements = parseInt(firstInputLine.split(" ")[0]);
    const minElementsToAverage = parseInt(firstInputLine.split(" ")[1]);
    const maxElementsToConsider = parseInt(firstInputLine.split(" ")[2]);
    let numericValues = Array(totalElements);

    let secondInputLineParts = inputBuffer.shift().split(" ");
    for (let idx = 0; idx < totalElements; idx++) {
        numericValues[idx] = Number(secondInputLineParts[idx]);
    }

    numericValues.sort(function(valA, valB) { return (valB - valA); });
    let highestAverage = 0;
    let valueCounts = {};

    for (let elementIndex = 0; elementIndex < totalElements; elementIndex++) {
        if (elementIndex < minElementsToAverage) {
            highestAverage += numericValues[elementIndex];
        }
        if (valueCounts[numericValues[elementIndex]] === undefined) {
            valueCounts[numericValues[elementIndex]] = 0;
        }

        valueCounts[numericValues[elementIndex]]++;
    }
    highestAverage /= minElementsToAverage;
    console.log(highestAverage);


    let elementCount = 0; let tempMultiplier = 1;
    let totalCombinations = 0;

    if (numericValues[0] !== numericValues[maxElementsToConsider - 1]) {
        totalCombinations = 1;
        for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
            if (valueCounts[numericValues[currentIdx]] >= 2) {
                let elementsToSelect = (valueCounts[numericValues[currentIdx]] > (minElementsToAverage - elementCount)) ? (minElementsToAverage - elementCount) : valueCounts[numericValues[currentIdx]];
                totalCombinations *= calculateCombinations(valueCounts[numericValues[currentIdx]], elementsToSelect);
                elementCount += valueCounts[numericValues[currentIdx]];
                currentIdx += valueCounts[numericValues[currentIdx]] - 1;
            }
            else {
                elementCount += valueCounts[numericValues[currentIdx]];
            }
        }
    }
    else {
        totalCombinations = 0;
        for (let numToPick = minElementsToAverage; numToPick <= maxElementsToConsider; numToPick++) {
            totalCombinations += calculateCombinations(valueCounts[numericValues[0]], numToPick);
        }
    }
    console.log(totalCombinations);

});

function calculatePermutations(totalItems, itemsToChoose) {
    let permutationResult = 1;
    for (let loopCounter = 0; loopCounter < itemsToChoose; loopCounter++) {
        permutationResult *= totalItems - loopCounter;
    }
    return permutationResult;
}

function calculateCombinations(totalAvailable, chosenItems) {
    return calculatePermutations(totalAvailable, chosenItems) / calculatePermutations(chosenItems, chosenItems);
}