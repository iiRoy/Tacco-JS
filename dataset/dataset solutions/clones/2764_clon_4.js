"use strict";

const main = rawInput => {
    const lines = rawInput.trim().split('\n');
    const [numPoints, dimensions] = lines[0].split(' ').map(Number);
    const allCoordinates = lines.slice(1, numPoints + 1).map(line => line.split(' ').map(Number));

    const computeDistance = (firstVector, secondVector) => {
        const squaredDifferencesSum = firstVector.reduce((sum, val1, idx) => sum + (val1 - secondVector[idx]) ** 2, 0);
        return Math.sqrt(squaredDifferencesSum);
    };

    const finalCount = allCoordinates.reduce((accumulator, currentPoint, currentIndex) => {
        for (let subsequentIndex = currentIndex + 1; subsequentIndex < numPoints; subsequentIndex++) {
            const nextPoint = allCoordinates[subsequentIndex];
            const distVal = computeDistance(currentPoint, nextPoint);
            if (Number.isInteger(distVal)) {
                accumulator++;
            }
        }
        return accumulator;
    }, 0);

    console.log(finalCount);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
