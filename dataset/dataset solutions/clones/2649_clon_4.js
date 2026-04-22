const dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = dataStream.split('\n');

const arrayDimension = Number(contentLines[0]);
const targetArray = contentLines[1].split(' ').map(Number);
const initialArray = contentLines[2].split(' ').map(Number);

const checkEquality = (arrA, arrB) => {
    if (arrA.length !== arrB.length) return false;
    for (let i = 0; i < arrA.length; ++i) {
        if (arrA[i] !== arrB[i]) return false;
    }
    return true;
};

const identifyNeighbors = (sequence, position, length) => {
    let leftComponent, rightComponent;
    if (position === 0) {
        leftComponent = sequence[length - 1];
        rightComponent = sequence[1];
    } else if (position === length - 1) {
        leftComponent = sequence[length - 2];
        rightComponent = sequence[0];
    } else {
        leftComponent = sequence[position - 1];
        rightComponent = sequence[position + 1];
    }
    return { leftComponent, rightComponent };
};

const transformSequence = (currentArrState, stepCounter, arrLength, desiredArrState) => {
    if (checkEquality(currentArrState, desiredArrState)) {
        return stepCounter;
    }

    if (currentArrState.some(val => val < 1)) {
        return -1;
    }

    let maxFoundValue = -Infinity;
    let maxFoundIndex = -1;
    for (let i = 0; i < arrLength; ++i) {
        if (currentArrState[i] > maxFoundValue) {
            maxFoundValue = currentArrState[i];
            maxFoundIndex = i;
        }
    }

    const { leftComponent, rightComponent } = identifyNeighbors(currentArrState, maxFoundIndex, arrLength);

    const nextArrState = [...currentArrState];
    nextArrState[maxFoundIndex] = currentArrState[maxFoundIndex] - leftComponent - rightComponent;

    return transformSequence(nextArrState, stepCounter + 1, arrLength, desiredArrState);
};

const finalResultValue = transformSequence(initialArray, 0, arrayDimension, targetArray);

console.log(finalResultValue);