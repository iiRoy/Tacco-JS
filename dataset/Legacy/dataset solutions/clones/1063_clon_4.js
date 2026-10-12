const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

let inversionTally = 0;

const uniteSegments = (sourceArray, startIdx, midIdx, endIdx) => {
    const tempArr = new Array(endIdx - startIdx);
    let leftPtr = startIdx;
    let rightPtr = midIdx;
    let tempIdx = 0;

    while (leftPtr < midIdx && rightPtr < endIdx) {
        if (sourceArray[leftPtr] <= sourceArray[rightPtr]) {
            tempArr[tempIdx++] = sourceArray[leftPtr++];
        } else {
            tempArr[tempIdx++] = sourceArray[rightPtr++];
            inversionTally += (midIdx - leftPtr);
        }
    }

    while (leftPtr < midIdx) {
        tempArr[tempIdx++] = sourceArray[leftPtr++];
    }

    while (rightPtr < endIdx) {
        tempArr[tempIdx++] = sourceArray[rightPtr++];
    }

    for (let i = 0; i < tempArr.length; i++) {
        sourceArray[startIdx + i] = tempArr[i];
    }
};

const sortAndCount = (sourceArray, startIdx, endIdx) => {
    if (startIdx + 1 < endIdx) {
        const midIdx = (startIdx + endIdx) >>> 1;
        sortAndCount(sourceArray, startIdx, midIdx);
        sortAndCount(sourceArray, midIdx, endIdx);
        uniteSegments(sourceArray, startIdx, midIdx, endIdx);
    }
};

const inputNumbers = inputLines[1].split(' ').map(Number);
sortAndCount(inputNumbers, 0, inputNumbers.length);
console.log(inversionTally);
