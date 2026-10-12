const STDIN_FILE_PATH = '/dev/stdin';
const fs = require('fs');

const parseNumbers = (line) => line.split(" ").map(Number);

const rawInputData = fs.readFileSync(STDIN_FILE_PATH, 'utf8');
const eventDescriptionLines = rawInputData.trim().split("\n");

const initialParametersLine = eventDescriptionLines.shift();
const initialParameters = parseNumbers(initialParametersLine);

const entityCount = initialParameters[0];
const lengthLimit = initialParameters[2];

const entityData = [];
for (let loopIndex = 0; loopIndex < entityCount; loopIndex++) {
    entityData.push([0, 0, loopIndex]);
}

let currentMaximum = [0, 0];
let lastEventTime = 0;

const sentinelEventLine = [1, lengthLimit, 0].join(" ");
eventDescriptionLines.push(sentinelEventLine);

const recalculateCurrentMaximum = (dataArray) => {
    let highestValue = 0;
    let highestValueIndex = 0;
    for (let innerLoopIndex = 0; innerLoopIndex < dataArray.length; innerLoopIndex++) {
        const entityValue = dataArray[innerLoopIndex][0];
        if (highestValue < entityValue) {
            highestValue = entityValue;
            highestValueIndex = innerLoopIndex;
        }
    }
    return [highestValueIndex, highestValue];
};

for (let loopIndex = 0; loopIndex < eventDescriptionLines.length; loopIndex++) {
    const currentEventDetails = parseNumbers(eventDescriptionLines[loopIndex]);

    const affectedEntityIndex = currentEventDetails[0] - 1;
    const eventTimestamp = currentEventDetails[1];
    const valueDelta = currentEventDetails[2];

    const timeElapsedSinceLastEvent = eventTimestamp - lastEventTime;
    entityData[currentMaximum[0]][1] += timeElapsedSinceLastEvent;
    lastEventTime = eventTimestamp;

    entityData[affectedEntityIndex][0] += valueDelta;

    if (valueDelta > 0) {
        const newEntityValue = entityData[affectedEntityIndex][0];
        const currentPeakValue = currentMaximum[1];
        const currentPeakIndex = currentMaximum[0];

        if (newEntityValue > currentPeakValue) {
            currentMaximum = [affectedEntityIndex, newEntityValue];
        } else if (newEntityValue === currentPeakValue && affectedEntityIndex <= currentPeakIndex) {
            currentMaximum = [affectedEntityIndex, newEntityValue];
        }
    } else if (valueDelta < 0 && currentMaximum[0] === affectedEntityIndex) {
        currentMaximum = recalculateCurrentMaximum(entityData);
    }
}

let highestAccumulatedValue = 0;
let highestAccumulatedEntityIndex = 0;

for (let loopIndex = 0; loopIndex < entityData.length; loopIndex++) {
    const accumulatedTime = entityData[loopIndex][1];
    if (highestAccumulatedValue < accumulatedTime) {
        highestAccumulatedValue = accumulatedTime;
        highestAccumulatedEntityIndex = loopIndex;
    }
}

console.log(highestAccumulatedEntityIndex + 1);
