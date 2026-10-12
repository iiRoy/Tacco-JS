"use strict";

const processInput = rawData => {
    const lines = rawData.trim().split("\n");

    const firstLineParts = lines[0].split(" ");
    const arraySize = parseInt(firstLineParts[0]);
    const numIterations = parseInt(firstLineParts[1]);

    let currentValues = lines[1].split(" ").map(elementStr => parseInt(elementStr));

    const calculateBounds = (idx, val, maxIdx) => {
        const lowerBound = idx - val;
        const upperBound = idx + val + 1;
        const effectiveLeft = Math.max(0, lowerBound);
        const effectiveRight = Math.min(upperBound, maxIdx);
        return { left: effectiveLeft, right: effectiveRight };
    };

    for (let iterationIndex = 0; iterationIndex < numIterations; iterationIndex++) {
        let diffArray = new Array(arraySize + 1).fill(0);

        for (let currentIndex = 0; currentIndex < arraySize; currentIndex++) {
            const currentVal = currentValues[currentIndex];
            const { left, right } = calculateBounds(currentIndex, currentVal, arraySize);
            diffArray[left]++;
            diffArray[right]--;
        }

        for (let currentIndex = 0; currentIndex < arraySize; currentIndex++) {
            diffArray[currentIndex + 1] += diffArray[currentIndex];
        }

        let allNReached = true;
        for (let currentIndex = 0; currentIndex < arraySize; currentIndex++) {
            if (diffArray[currentIndex] !== arraySize) {
                allNReached = false;
                break;
            }
        }

        diffArray.pop();
        currentValues = diffArray;
        if (allNReached) {
            break;
        }
    }
    console.log(currentValues.join(" "));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
