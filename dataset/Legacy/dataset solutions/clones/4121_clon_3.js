"use strict";
const fileSystem = require("fs");
const rawData = fileSystem.readFileSync("/dev/stdin", "utf8");
let tokenArray = rawData.split(/ |\n/);
let tokenIndex = 0;

function readNum() {
    return +tokenArray[tokenIndex++];
}

function readStr() {
    return tokenArray[tokenIndex++];
}

function readBigInt() {
    return BigInt(tokenArray[tokenIndex++]);
}

function readNums(count, asStrings) {
    if (asStrings) {
        return tokenArray.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenArray.slice(tokenIndex, tokenIndex += count).map(val => +val);
    }
}

function readMatrix(height, width, asStrings) {
    const resultMatrix = [];
    let rowCounter = 0;
    if (asStrings) {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

// Type III change: Replaced eval-based xArray with a recursive function for multi-dimensional array creation.
function createMultiDimArray(initialValue, ...dimensions) {
    const generateDimension = (currentDimIndex) => {
        if (currentDimIndex === dimensions.length - 1) {
            return Array(dimensions[currentDimIndex]).fill(initialValue);
        } else {
            return Array(dimensions[currentDimIndex]).fill(null).map(() => generateDimension(currentDimIndex + 1));
        }
    };
    if (dimensions.length === 0) {
        return initialValue;
    }
    return generateDimension(0);
}

// Type III change: Extracted core calculation logic into a dedicated helper function.
function calculateNextDepartureAndArrival(currentTimeAtStation, minDepartureTimeFromStation, intervalDuration, travelDurationToNextStation) {
    let effectiveDepartureTime = currentTimeAtStation;
    // If current time is before the earliest allowed departure, wait until earliest departure.
    if (effectiveDepartureTime < minDepartureTimeFromStation) {
        effectiveDepartureTime = minDepartureTimeFromStation;
    }
    // Calculate the next departure time that is a multiple of the intervalDuration.
    // This ensures departure happens at a valid interval point.
    let departureFromCurrentStation = Math.ceil(effectiveDepartureTime / intervalDuration) * intervalDuration;
    // Add travel duration to get arrival time at the next station.
    return departureFromCurrentStation + travelDurationToNextStation;
}

function executeProgram() {
    const numStations = readNum();
    const arrivalTimes = createMultiDimArray(0, numStations);
    const connectionData = readMatrix(numStations - 1, 3);

    // Loop through each connection to update arrival times for relevant stations.
    for (let currentConnectionIdx = 0; currentConnectionIdx < numStations - 1; currentConnectionIdx++) {
        // Introduce temporary constants for clarity and readability.
        const travelDuration = connectionData[currentConnectionIdx][0];
        const earliestDeparture = connectionData[currentConnectionIdx][1];
        const departureInterval = connectionData[currentConnectionIdx][2];

        // Update arrival times for all stations up to the current connection.
        for (let currentStationIdx = 0; currentStationIdx <= currentConnectionIdx; currentStationIdx++) {
            arrivalTimes[currentStationIdx] = calculateNextDepartureAndArrival(
                arrivalTimes[currentStationIdx],
                earliestDeparture,
                departureInterval,
                travelDuration
            );
        }
    }
    return arrivalTimes.join("\n");
}

const programOutput = executeProgram();
if (programOutput !== undefined) {
    console.log(programOutput);
}
