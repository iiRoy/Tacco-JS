'use strict';

function getCentralValue(numericCollection) {
    if (numericCollection.length === 0) {
        return undefined;
    }

    function performMergeSort(dataCollection) {
        if (dataCollection.length <= 1) {
            return dataCollection;
        }

        const midPoint = Math.floor(dataCollection.length / 2);
        const leftHalf = dataCollection.slice(0, midPoint);
        const rightHalf = dataCollection.slice(midPoint);

        const sortedLeft = performMergeSort(leftHalf);
        const sortedRight = performMergeSort(rightHalf);

        return mergeSegments(sortedLeft, sortedRight);
    }

    function mergeSegments(leftPart, rightPart) {
        let resultArr = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < leftPart.length && rightIndex < rightPart.length) {
            if (leftPart[leftIndex] < rightPart[rightIndex]) {
                resultArr.push(leftPart[leftIndex]);
                leftIndex++;
            } else {
                resultArr.push(rightPart[rightIndex]);
                rightIndex++;
            }
        }

        return resultArr.concat(leftPart.slice(leftIndex)).concat(rightPart.slice(rightIndex));
    }

    const sortedCollection = performMergeSort([...numericCollection]);
    const targetIndex = Math.floor(sortedCollection.length / 2);
    return sortedCollection[targetIndex];
}

function initiateCalculation(rawInputString) {
    const inputSegments = rawInputString.split('\n');
    const firstLineParts = inputSegments[0].split(' ');
    const quantity = Number(firstLineParts[0]);
    const sourceNumbers = inputSegments[1].split(' ').map(val => Number(val));

    const allSubarrayCentralValues = [];

    Array.from({ length: quantity }, (_, outerIdx) => {
        Array.from({ length: outerIdx + 1 }, (_, innerIdx) => {
            const currentSegment = sourceNumbers.slice(innerIdx, outerIdx + 1);
            const segmentCentralValue = getCentralValue(currentSegment);
            allSubarrayCentralValues.push(segmentCentralValue);
        });
    });

    const finalResult = getCentralValue(allSubarrayCentralValues);
    return finalResult;
}

const runTestScenario = false;

if (runTestScenario) {
    console.log(initiateCalculation('3\n10 30 20'));
    console.log(initiateCalculation('1\n10'));
    console.log(initiateCalculation('10\n5 9 5 9 8 9 3 5 4 3'));
} else {
    const fileSystemAccess = require('fs');
    const rawData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    console.log(initiateCalculation(rawData));
}