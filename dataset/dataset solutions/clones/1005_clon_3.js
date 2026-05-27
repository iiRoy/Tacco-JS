const inputFilePath = '/dev/stdin';
const rawData = require('fs').readFileSync(inputFilePath, 'utf8');

const lines = rawData.trim().split("\n");

const parseNumbersLine = (lineContent) => {
    return lineContent.split(' ').map(str => Number(str));
};

let numArr = parseNumbersLine(lines[1]);

let swapCounter = 0;

const swapElements = (array, indexA, indexB) => {
    if (indexA === indexB) {
        return;
    }
    const tempVal = array[indexA];
    array[indexA] = array[indexB];
    array[indexB] = tempVal;
    swapCounter++;
};

const arrLen = numArr.length;

for (let outerIdx = 0; outerIdx < arrLen; outerIdx++) {
    let minValIdx = outerIdx;

    for (let innerIdx = outerIdx; innerIdx < arrLen; innerIdx++) {
        if (numArr[innerIdx] < numArr[minValIdx]) {
            minValIdx = innerIdx;
        }
    }

    swapElements(numArr, outerIdx, minValIdx);
}

console.log(numArr.join(' '));
console.log(swapCounter);
