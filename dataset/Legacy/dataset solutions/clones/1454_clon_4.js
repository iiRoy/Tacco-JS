const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numberLine = fileData.trim().split('\n')[1];
const numericSequence = numberLine.split(' ').map(Number);

function combineHalves(leftPortion, rightPortion) {
    let combinedResult = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftPortion.length && rightIndex < rightPortion.length) {
        if (leftPortion[leftIndex] < rightPortion[rightIndex]) {
            combinedResult.push(leftPortion[leftIndex]);
            leftIndex++;
        } else {
            combinedResult.push(rightPortion[rightIndex]);
            rightIndex++;
        }
    }

    return combinedResult.concat(leftPortion.slice(leftIndex)).concat(rightPortion.slice(rightIndex));
}

function recursiveSort(dataCollection) {
    if (dataCollection.length <= 1) {
        return dataCollection;
    }

    const middlePoint = Math.floor(dataCollection.length / 2);
    const leftHalf = dataCollection.slice(0, middlePoint);
    const rightHalf = dataCollection.slice(middlePoint);

    const sortedLeft = recursiveSort(leftHalf);
    const sortedRight = recursiveSort(rightHalf);

    return combineHalves(sortedLeft, sortedRight);
}

const orderedSequence = recursiveSort(numericSequence);

console.log(orderedSequence.join(' '));
