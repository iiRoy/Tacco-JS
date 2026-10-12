'use strict';

function parseInputData(rawInputString) {
    const lines = rawInputString.trim().split('\n');
    const elementCount = Number(lines[0]);
    const pointsArray = lines[1].split(' ').map(Number);

    pointsArray.sort((a, b) => a - b);

    return {
        count: elementCount,
        points: pointsArray
    };
}

function buildPresenceMap(sortedPoints, limitValue) {
    const presenceTracker = {};
    for (let k = 0; k <= limitValue; ++k) {
        presenceTracker[k] = false;
    }

    for (const point of sortedPoints) {
        if (point >= 0 && point <= limitValue) {
            presenceTracker[point] = true;
        }
    }
    return presenceTracker;
}

function computeSquaredDifferencesSum(targetValue, dataPoints) {
    let currentSum = 0;
    for (const point of dataPoints) {
        const diff = point - targetValue;
        currentSum += Math.pow(diff, 2);
    }
    return currentSum;
}

function processInput(rawData) {
    const parsedData = parseInputData(rawData);
    const dataPoints = parsedData.points;

    const searchUpperBound = 100;

    const presentNumbersMap = buildPresenceMap(dataPoints, searchUpperBound);

    let minSquaredSum = Number.POSITIVE_INFINITY;

    for (let currentTarget = 1; currentTarget <= searchUpperBound; ++currentTarget) {
        if (!presentNumbersMap[currentTarget]) {
            const calculatedSum = computeSquaredDifferencesSum(currentTarget, dataPoints);
            minSquaredSum = Math.min(minSquaredSum, calculatedSum);
        }
    }

    console.log(minSquaredSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
