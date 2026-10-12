const fileSystem = require('fs');

function gapInsertionSort(targetArray, arraySize, currentGap, sortMetrics) {
    for (let currentElementIndex = currentGap; currentElementIndex < arraySize; currentElementIndex++) {
        const valueToInsert = targetArray[currentElementIndex];
        let comparisonIndex = currentElementIndex - currentGap;

        for (; comparisonIndex >= 0; comparisonIndex -= currentGap) {
            if (targetArray[comparisonIndex] > valueToInsert) {
                targetArray[comparisonIndex + currentGap] = targetArray[comparisonIndex];
                sortMetrics.totalShifts++;
            } else {
                break;
            }
        }
        targetArray[comparisonIndex + currentGap] = valueToInsert;
    }
}

function performShellSort(dataCollection, collectionSize) {
    const sortingMetrics = { totalShifts: 0 };

    const maxPower = Math.floor(Math.log2(collectionSize + 1));
    const gapSequence = Array.from({ length: maxPower }, (_, index) => Math.pow(2, index + 1) - 1)
                             .filter(gapVal => gapVal <= collectionSize)
                             .reverse();

    const numberOfGaps = gapSequence.length;

    gapSequence.forEach(currentGap => {
        gapInsertionSort(dataCollection, collectionSize, currentGap, sortingMetrics);
    });

    console.log(numberOfGaps);
    console.log(gapSequence.join(' '));
    console.log(sortingMetrics.totalShifts);
    dataCollection.forEach(element => console.log(element));
}

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.split('\n');
const dataSize = Number(inputLines.shift());

const dataArray = inputLines.map(Number);

performShellSort(dataArray, dataSize);
