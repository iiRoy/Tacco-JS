const sourceConfiguration = {
    sourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

const inputLines = require('fs').readFileSync(sourceConfiguration.sourcePath, 'utf-8').split(sourceConfiguration.lineDelimiter);

let globalCounter = 0;

const subArrayInsertionSort = (targetArray, interval) => {
    for (let outerIndex = interval; outerIndex < targetArray.length; outerIndex++) {
        const valueToPlace = targetArray[outerIndex];
        let innerIndex = outerIndex;
        for (let comparisonIndex = outerIndex - interval; comparisonIndex >= 0; comparisonIndex -= interval) {
            if (targetArray[comparisonIndex] > valueToPlace) {
                targetArray[innerIndex] = targetArray[comparisonIndex];
                innerIndex = comparisonIndex;
                globalCounter++;
            } else {
                break;
            }
        }
        targetArray[innerIndex] = valueToPlace;
    }
};

const performGapSort = (inputArray) => {
    const createGapSequence = (upperBound, currentVal = 1, sequence = []) => {
        if (currentVal > upperBound) {
            return sequence;
        }
        return createGapSequence(upperBound, 3 * currentVal + 1, [...sequence, currentVal]);
    };

    let gapValues = createGapSequence(inputArray.length);
    const reversedGapValues = gapValues.reverse();

    console.log(reversedGapValues.length);
    console.log(reversedGapValues.map(String).join(' '));

    reversedGapValues.forEach(currentGap => {
        subArrayInsertionSort(inputArray, currentGap);
    });

    return inputArray;
};

const elementCount = Number(inputLines[0]);
const numericData = inputLines.slice(1, elementCount + 1).map(Number);
const finalSortedArray = performGapSort(numericData);

console.log(globalCounter);
console.log(finalSortedArray.map(String).join('\n'));
