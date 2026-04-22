let totalInversions = 0;

const combineParts = (leftHalf, rightHalf) => {
    let combined = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftHalf.length && rightIndex < rightHalf.length) {
        if (leftHalf[leftIndex] <= rightHalf[rightIndex]) {
            combined.push(leftHalf[leftIndex]);
            leftIndex++;
        } else {
            totalInversions += (leftHalf.length - leftIndex);
            combined.push(rightHalf[rightIndex]);
            rightIndex++;
        }
    }

    return combined.concat(leftHalf.slice(leftIndex)).concat(rightHalf.slice(rightIndex));
};

const divideAndConquer = (dataSegment) => {
    if (dataSegment.length <= 1) {
        return dataSegment;
    }

    const midPoint = Math.floor(dataSegment.length / 2);
    const leftHalf = divideAndConquer(dataSegment.slice(0, midPoint));
    const rightHalf = divideAndConquer(dataSegment.slice(midPoint));

    return combineParts(leftHalf, rightHalf);
};

const sourceLocation = '/dev/stdin';
const separatorChar = '\n';

const fileContents = require('fs').readFileSync(sourceLocation, 'utf-8');
const allLines = fileContents.split(separatorChar);

const numericStrings = allLines[1].split(' ');
const parsedNumbers = numericStrings.map(val => parseInt(val));

const finalSortedArray = divideAndConquer(parsedNumbers);

console.log(finalSortedArray.join(' '));
console.log(totalInversions);