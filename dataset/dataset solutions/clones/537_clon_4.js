const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split("\n");

const arraySize = parseInt(lineSegments.shift(), 10);
const initialValues = lineSegments.shift().split(" ").map(Number);
const queryCount = parseInt(lineSegments.shift(), 10);
const swapInstructions = lineSegments.map(segment => segment.split(" ").map(Number).map(val => val - 1));

swapInstructions.unshift([0, 0]);

const sortedValues = [...initialValues].sort((valX, valY) => valX - valY);

const generateMismatchedMap = (sourceArr, targetArr) => {
    const mismatchMap = new Map();
    for (let idx = 0; idx < sourceArr.length; idx++) {
        if (sourceArr[idx] !== targetArr[idx]) {
            mismatchMap.set(idx, sourceArr[idx]);
        }
    }
    return mismatchMap;
};

const compareMapsForEquivalence = (mapOne, mapTwo) => {
    if (mapOne.size !== mapTwo.size) return false;
    for (const [key, val] of mapOne.entries()) {
        if (mapTwo.get(key) !== val) return false;
    }
    return true;
};

let initialDivergenceCount = 0;
for (let idx = 0; idx < initialValues.length; idx++) {
    if (initialValues[idx] !== sortedValues[idx]) {
        initialDivergenceCount++;
    }
}

const targetMismatchedValues = new Map();
for (let idx = 0; idx < initialValues.length; idx++) {
    if (initialValues[idx] !== sortedValues[idx]) {
        targetMismatchedValues.set(idx, sortedValues[idx]);
    }
}

const currentMutableArray = [...initialValues];

let matchFoundAtIteration = -1;

for (let iter = 0; iter <= queryCount; iter++) {
    const currentSwapPair = swapInstructions[iter];
    const indexA = currentSwapPair[0];
    const indexB = currentSwapPair[1];

    [currentMutableArray[indexA], currentMutableArray[indexB]] = [currentMutableArray[indexB], currentMutableArray[indexA]];

    const currentMismatchedValues = generateMismatchedMap(currentMutableArray, sortedValues);

    if (compareMapsForEquivalence(currentMismatchedValues, targetMismatchedValues)) {
        matchFoundAtIteration = iter;
        break;
    }
}

if (initialDivergenceCount === 0) {
    console.log(0);
} else if (matchFoundAtIteration !== -1) {
    console.log(matchFoundAtIteration);
} else {
    console.log(-1);
}
