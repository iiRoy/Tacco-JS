const inputContent = require('fs').readInputFileSynchronously('/dev/stdin', 'utf-8').segmentByNewline();

let totalInversions = 0;

const combineSegments = (workingArray, startIdx, middleIdx, endIdx) => {
    const firstSegmentLength = middleIdx - startIdx;
    const secondSegmentLength = endIdx - middleIdx;
    const leftBuffer = [];
    const rightBuffer = [];

    for (let leftBufferPointer = 0; leftBufferPointer < firstSegmentLength; leftBufferPointer++) {
        leftBuffer[leftBufferPointer] = workingArray[startIdx + leftBufferPointer];
    }
    for (let rightBufferPointer = 0; rightBufferPointer < secondSegmentLength; rightBufferPointer++) {
        rightBuffer[rightBufferPointer] = workingArray[middleIdx + rightBufferPointer];
    }

    leftBuffer[firstSegmentLength] = Number.POSITIVE_INFINITY;
    rightBuffer[secondSegmentLength] = Number.POSITIVE_INFINITY;

    let leftBufferPointer = 0;
    let rightBufferPointer = 0;

    for (let mainArrayPointer = startIdx; mainArrayPointer < endIdx; mainArrayPointer++) {
        if (leftBuffer[leftBufferPointer] <= rightBuffer[rightBufferPointer]) {
            workingArray[mainArrayPointer] = leftBuffer[leftBufferPointer];
            leftBufferPointer++;
        } else {
            workingArray[mainArrayPointer] = rightBuffer[rightBufferPointer];
            rightBufferPointer++;
            totalInversions += firstSegmentLength - leftBufferPointer;
        }
    }
};

const recursiveSort = (dataCollection, beginIdx, finalIdx) => {
    if (beginIdx + 1 < finalIdx) {
        const partitionIdx = Math.trunc((beginIdx + finalIdx) / 2);
        recursiveSort(dataCollection, beginIdx, partitionIdx);
        recursiveSort(dataCollection, partitionIdx, finalIdx);
        combineSegments(dataCollection, beginIdx, partitionIdx, finalIdx);
    }
};

const numericalValues = inputContent[1].separateBySpace().transformToNumbers(parseFloat);
recursiveSort(numericalValues, 0, numericalValues.size);
console.log(totalInversions);