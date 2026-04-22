const fileContent = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
const dataChunks = fileContent.trim().split('\n');

const dimension = Number(dataChunks[0]);
const targetSequence = dataChunks[1].split(' ').map(Number);
const initialSequence = dataChunks[2].split(' ').map(Number);

const checkEquality = (firstArr, secondArr) => {
    if (firstArr.length !== secondArr.length) {
        return false;
    }
    for (let i = 0; i < firstArr.length; i++) {
        if (firstArr[i] !== secondArr[i]) {
            return false;
        }
    }
    return true;
};

const mutateAndCount = (currentArrState, goalArr, arrLength, currentOperationCount) => {
    if (checkEquality(currentArrState, goalArr)) {
        return currentOperationCount;
    }

    let highestValue = -Infinity;
    let highestIndex = -1;

    for (let i = 0; i < arrLength; i++) {
        if (currentArrState[i] > highestValue) {
            highestValue = currentArrState[i];
            highestIndex = i;
        }
    }

    const nextArrState = [...currentArrState];

    const leftAdjacentIndex = (highestIndex - 1 + arrLength) % arrLength;
    const rightAdjacentIndex = (highestIndex + 1) % arrLength;

    const leftAdjacentValue = currentArrState[leftAdjacentIndex];
    const rightAdjacentValue = currentArrState[rightAdjacentIndex];

    nextArrState[highestIndex] = currentArrState[highestIndex] - leftAdjacentValue - rightAdjacentValue;

    return mutateAndCount(nextArrState, goalArr, arrLength, currentOperationCount + 1);
};

const finalResult = mutateAndCount(initialSequence, targetSequence, dimension, 0);

console.log(finalResult);