"use strict";

const processInputData = (inputString) => {
    const inputLines = inputString.split("\n");
    const thresholdValue = parseInt(inputLines.pop(), 10);
    const measurementPoints = inputLines.slice(0, 5).map(val => parseInt(val, 10));

    if (measurementPoints.length < 2) {
        console.log("Yay!");
        return;
    }

    const { maxObservedDifference } = measurementPoints.reduce((accumulator, currentPoint, currentIndex) => {
        if (currentIndex === 0) {
            return {
                minSoFar: currentPoint,
                maxObservedDifference: -Infinity,
            };
        }

        const currentDifference = currentPoint - accumulator.minSoFar;
        const newMaxObservedDifference = Math.max(accumulator.maxObservedDifference, currentDifference);
        const newMinSoFar = Math.min(accumulator.minSoFar, currentPoint);

        return {
            minSoFar: newMinSoFar,
            maxObservedDifference: newMaxObservedDifference,
        };
    }, { minSoFar: Infinity, maxObservedDifference: -Infinity });

    if (maxObservedDifference > thresholdValue) {
        console.log(":(");
    } else {
        console.log("Yay!");
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
