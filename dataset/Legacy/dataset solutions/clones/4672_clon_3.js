var inputLines = [];
var ioHandler = require('readline');

var inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputReader.on('close', function () {
    const initialParamsLine = inputLines.shift();
    const paramStrings = initialParamsLine.split(" ");
    const numElements = Number(paramStrings[0]);
    const minSelection = Number(paramStrings[1]);
    const maxSelection = Number(paramStrings[2]);

    const elementValueStrings = inputLines.shift().split(" ");
    const elementValues = elementValueStrings.map(Number);

    elementValues.sort(function (valA, valB) { return (valB - valA); });

    let currentSumForAverage = 0;
    const valueFrequencyMap = {};
    const selectionLimit = minSelection;

    for (let loopIndex = 0; loopIndex < numElements; loopIndex++) {
        const currentValue = elementValues[loopIndex];
        if (loopIndex < selectionLimit) {
            currentSumForAverage += currentValue;
        }

        if (valueFrequencyMap[currentValue] === undefined) {
            valueFrequencyMap[currentValue] = 0;
        }
        valueFrequencyMap[currentValue]++;
    }
    const calculatedAverage = currentSumForAverage / selectionLimit;
    console.log(calculatedAverage);

    let totalCombinations = 0;

    const firstLargestValue = elementValues[0];
    const bthLargestValue = elementValues[maxSelection - 1];

    if (firstLargestValue !== bthLargestValue) {
        const targetValueForCombinations = elementValues[minSelection - 1];
        let countOfTargetValueInTopSelection = 0;
        for (let k = 0; k < minSelection; k++) {
            if (elementValues[k] === targetValueForCombinations) {
                countOfTargetValueInTopSelection++;
            }
        }
        const totalCountOfTargetValue = valueFrequencyMap[targetValueForCombinations];
        totalCombinations = calculateCombinations(totalCountOfTargetValue, countOfTargetValueInTopSelection);
    } else {
        let currentCombinations = 0;
        for (let numToPick = 1; numToPick <= maxSelection; numToPick++) {
            currentCombinations += calculateCombinations(maxSelection, numToPick);
        }
        totalCombinations = currentCombinations;
    }
    console.log(totalCombinations);
});

function calculatePermutations(totalItems, itemsToChoose) {
    let resultProduct = 1;
    for (let currentFactor = 0; currentFactor < itemsToChoose; currentFactor++) {
        resultProduct *= totalItems - currentFactor;
    }
    return resultProduct;
}

function calculateCombinations(totalItems, itemsToChoose) {
    return calculatePermutations(totalItems, itemsToChoose) / calculatePermutations(itemsToChoose, itemsToChoose);
}
