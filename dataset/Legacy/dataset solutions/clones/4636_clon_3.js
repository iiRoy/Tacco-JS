'use strict'

const MAX_VAL_LIMIT = 900719925474099;

const parseLineToNumbers = (lineStr) => lineStr.split(' ').map(Number);

function findLowerBoundIndex(sortedArray, searchStart, searchEnd, targetValue) {
    let left = searchStart;
    let right = searchEnd;
    while (left + 1 < right) {
        let mid = Math.floor((left + right) / 2);
        if (sortedArray[mid] < targetValue) {
            left = mid;
        } else {
            right = mid;
        }
    }
    return sortedArray[left] < targetValue ? right : left;
}

const PRIME_MODULUS = 1000000007;

function parseSimulationParameters(line) {
    const params = parseLineToNumbers(line);
    return {
        numAnts: params[0],
        trackLength: params[1],
        timeElapsed: params[2] % params[1]
    };
}

function calculateAntFinalPosition(initialPos, direction, time, trackLength) {
    if (direction === 1) {
        return (initialPos - time + trackLength) % trackLength;
    } else {
        return (initialPos + time) % trackLength;
    }
}

function determineCollisionOffset(
    firstAntPos, firstAntDir, currentAntPos, currentAntDir,
    trackLength, totalTime, totalAnts, currentOffset
) {
    let timeToCollision;
    let newOffset = currentOffset;

    if (firstAntDir === 2 && currentAntDir === 1) {
        if (firstAntPos < currentAntPos) {
            timeToCollision = (trackLength + firstAntPos - currentAntPos) / 2;
        } else {
            timeToCollision = (firstAntPos - currentAntPos) / 2;
        }

        if (timeToCollision <= totalTime) {
            newOffset = (newOffset + totalAnts) % totalAnts;
            if (timeToCollision + trackLength / 2 <= totalTime) {
                newOffset = (newOffset - 2 + totalAnts) % totalAnts;
            } else {
                newOffset = (newOffset - 1 + totalAnts) % totalAnts;
            }
        }
    } else if (firstAntDir === 1 && currentAntDir === 2) {
        if (firstAntPos > currentAntPos) {
            timeToCollision = (trackLength - firstAntPos + currentAntPos) / 2;
        } else {
            timeToCollision = (currentAntPos - firstAntPos) / 2;
        }

        if (timeToCollision <= totalTime) {
            newOffset = (newOffset + totalAnts) % totalAnts;
            if (timeToCollision + trackLength / 2 <= totalTime) {
                newOffset = (newOffset + 2) % totalAnts;
            } else {
                newOffset = (newOffset + 1) % totalAnts;
            }
        }
    }
    return newOffset;
}

function processAntSimulation(rawData) {
    const allInputLines = rawData.trim().split('\n');

    const { numAnts, trackLength, timeElapsed } = parseSimulationParameters(allInputLines[0]);

    const firstAntInitialState = parseLineToNumbers(allInputLines[1]);
    const firstAntInitialPos = firstAntInitialState[0];
    const firstAntInitialDir = firstAntInitialState[1];

    const finalPositionsUnsorted = new Array(numAnts);
    let collisionOffsetCount = 0;

    for (let antIdx = 1; antIdx <= numAnts; antIdx++) {
        const currentAntInitialState = parseLineToNumbers(allInputLines[antIdx]);
        const currentAntInitialPos = currentAntInitialState[0];
        const currentAntInitialDir = currentAntInitialState[1];

        collisionOffsetCount = determineCollisionOffset(
            firstAntInitialPos, firstAntInitialDir,
            currentAntInitialPos, currentAntInitialDir,
            trackLength, timeElapsed, numAnts, collisionOffsetCount
        );

        finalPositionsUnsorted[antIdx - 1] = calculateAntFinalPosition(
            currentAntInitialPos, currentAntInitialDir, timeElapsed, trackLength
        );
    }

    const firstAntFinalPosition = finalPositionsUnsorted[0];
    finalPositionsUnsorted.sort((a, b) => a - b);

    const sortedPosStartIndex = findLowerBoundIndex(finalPositionsUnsorted, 0, numAnts, firstAntFinalPosition);

    const finalPositionsOrdered = new Array(numAnts);
    for (let k = 0; k < numAnts; k++) {
        const sourceSortedIndex = (sortedPosStartIndex + k) % numAnts;
        const destinationOutputIndex = (collisionOffsetCount + k) % numAnts;
        finalPositionsOrdered[destinationOutputIndex] = finalPositionsUnsorted[sourceSortedIndex];
    }

    console.log(finalPositionsOrdered.join('\n'));
}

processAntSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
