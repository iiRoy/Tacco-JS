const INPUT_SOURCE = '/dev/stdin';
const NEWLINE_CHAR = '\n';

const inputLines = require('fs').readFileSync(INPUT_SOURCE, 'utf-8').split(NEWLINE_CHAR);

let swapCount = 0;

const insertionSortWithGap = (dataArray, gapValue) => {
    const dataLength = dataArray.length;
    for (let i = gapValue; i < dataLength; i++) {
        const currentValue = dataArray[i];
        let comparisonIndex = i - gapValue;
        while (comparisonIndex >= 0 && dataArray[comparisonIndex] > currentValue) {
            dataArray[comparisonIndex + gapValue] = dataArray[comparisonIndex];
            comparisonIndex -= gapValue;
            swapCount++;
        }
        dataArray[comparisonIndex + gapValue] = currentValue;
    }
};

const performShellSort = (dataArray) => {

    const gapSequenceAscending = [];
    let currentGapElement = 1;
    gapSequenceAscending.push(currentGapElement);

    while (true) {
        const nextCalculatedGap = 3 * currentGapElement + 1;
        if (nextCalculatedGap > dataArray.length) {
            break;
        }
        gapSequenceAscending.push(nextCalculatedGap);
        currentGapElement = nextCalculatedGap;
    }

    const finalGapSequence = gapSequenceAscending.reverse();

    console.log(finalGapSequence.length);
    console.log(finalGapSequence.map(element => element.toString()).join(' '));

    for (let i = 0; i < finalGapSequence.length; i++) {
        insertionSortWithGap(dataArray, finalGapSequence[i]);
    }

    return dataArray;
};

const arraySize = parseInt(inputLines[0]);
const initialData = inputLines.slice(1, arraySize + 1).map(element => parseInt(element));
const finalSortedArray = performShellSort(initialData);

console.log(swapCount);
console.log(finalSortedArray.map(element => element.toString()).join('\n'));
