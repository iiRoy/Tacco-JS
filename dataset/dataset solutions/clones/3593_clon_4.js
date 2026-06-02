'use strict';

const findMiddleElement = (valueCollection) => {
    const orderedCollection = [...valueCollection].sort((valA, valB) => valA - valB);
    const centralIndex = Math.floor(orderedCollection.length / 2);
    return orderedCollection[centralIndex];
};

const processInput = (inputData) => {
    const dataLines = inputData.split('\n');
    const firstLineParts = dataLines[0].split(' ');
    const countElements = parseInt(firstLineParts[0], 10);
    const sourceArray = dataLines[1].split(' ').map(val => parseInt(val, 10));

    const allSubarrayMedians = Array.from({ length: countElements }, (_, rightBound) => {
        return Array.from({ length: rightBound + 1 }, (_, leftBound) => {
            const currentSubarray = sourceArray.slice(leftBound, rightBound + 1);
            return findMiddleElement(currentSubarray);
        });
    }).flat();

    console.log(findMiddleElement(allSubarrayMedians));
};

const isTestMode = false;

if (isTestMode) {
    processInput('3\n10 30 20');
    processInput('1\n10');
    processInput('10\n5 9 5 9 8 9 3 5 4 3');
} else {
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
