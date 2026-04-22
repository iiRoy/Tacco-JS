const fileSystemUtil = require('fs');

const sourceData = fileSystemUtil.readFileSync('/dev/stdin', 'utf8');

const dataSegments = sourceData.split('\n');

const computeCombinations = (totalItems, selectedItems) => {
    if (selectedItems < 0 || selectedItems > totalItems) {
        return 0;
    }
    if (selectedItems === 0 || selectedItems === totalItems) {
        return 1;
    }
    if (selectedItems > totalItems / 2) {
        selectedItems = totalItems - selectedItems;
    }

    let combinationValue = 1;
    for (let currentItem = 1; currentItem <= selectedItems; currentItem++) {
        combinationValue = combinationValue * (totalItems - currentItem + 1) / currentItem;
    }
    return combinationValue;
};

const outputDisplay = (resultValue) => {
    process.stdout.write(resultValue + '\n');
};

let currentProcessIndex = 0;
while (currentProcessIndex < dataSegments.length - 1) {
    const currentSegment = dataSegments[currentProcessIndex];

    const digitArray = currentSegment.split('').map(Number);
    const segmentLength = digitArray.length;

    if (segmentLength === 0) {
        outputDisplay(undefined);
        currentProcessIndex++;
        continue;
    }

    const pascalRowIndex = segmentLength - 1;
    let finalSum = 0;

    digitArray.forEach((digitValue, coefficientIndex) => {
        const coefficient = computeCombinations(pascalRowIndex, coefficientIndex);
        finalSum = (finalSum + digitValue * coefficient) % 10;
    });

    outputDisplay(finalSum);
    currentProcessIndex++;
}