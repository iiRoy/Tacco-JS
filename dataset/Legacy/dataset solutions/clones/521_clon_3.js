const TASK_VALUE_INDEX = 0;
const TASK_TIME_ACCUMULATOR_INDEX = 1;
const TASK_ORIGINAL_ID_INDEX = 2;

function parseEventDetails(rawEventString) {
    return rawEventString.split(" ").map(Number);
}

function determineLeadingTask(allTaskRecords) {
    if (allTaskRecords.length === 0) {
        return [0, 0];
    }

    let highestValueFound = allTaskRecords[0][TASK_VALUE_INDEX];
    let highestValueIndex = 0;

    for (let i = 1; i < allTaskRecords.length; i++) {
        const currentTaskValue = allTaskRecords[i][TASK_VALUE_INDEX];
        if (currentTaskValue > highestValueFound) {
            highestValueFound = currentTaskValue;
            highestValueIndex = i;
        }
    }
    return [highestValueIndex, highestValueFound];
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

let eventLines = fileContent.trim().split("\n");

const initialConfigLine = eventLines.shift();
const initialConfig = parseEventDetails(initialConfigLine);

const numTasks = initialConfig[0];
const limitValue = initialConfig[2];

let taskRecords = Array.from({ length: numTasks }, (_, idx) => [0, 0, idx]);

let currentLeadingTask = [0, 0];

let lastEventTime = 0;

const finalEventData = [1, limitValue, 0];
eventLines.push(finalEventData.join(" "));

for (const rawLine of eventLines) {
    const parsedEvent = parseEventDetails(rawLine);

    const affectedTaskIndex = parsedEvent[0] - 1;
    const eventTimestamp = parsedEvent[1];
    const valueModifier = parsedEvent[2];

    const timeElapsedSinceLastEvent = eventTimestamp - lastEventTime;

    const leaderTaskIdentifier = currentLeadingTask[TASK_ORIGINAL_ID_INDEX];
    taskRecords[leaderTaskIdentifier][TASK_TIME_ACCUMULATOR_INDEX] += timeElapsedSinceLastLastEvent;

    lastEventTime = eventTimestamp;

    taskRecords[affectedTaskIndex][TASK_VALUE_INDEX] += valueModifier;

    if (valueModifier > 0) {
        const updatedTaskValue = taskRecords[affectedTaskIndex][TASK_VALUE_INDEX];
        const currentLeaderValue = currentLeadingTask[TASK_VALUE_INDEX];
        const currentLeaderIndex = currentLeadingTask[TASK_ORIGINAL_ID_INDEX];

        if (updatedTaskValue > currentLeaderValue) {
            currentLeadingTask = [affectedTaskIndex, updatedTaskValue];
        } else if (updatedTaskValue === currentLeaderValue && affectedTaskIndex <= currentLeaderIndex) {
            currentLeadingTask = [affectedTaskIndex, updatedTaskValue];
        }
    } else if (valueModifier < 0) {
        currentLeadingTask = determineLeadingTask(taskRecords);
    }
}

taskRecords.sort((recordA, recordB) => {
    const timeA = recordA[TASK_TIME_ACCUMULATOR_INDEX];
    const timeB = recordB[TASK_TIME_ACCUMULATOR_INDEX];

    if (timeA === timeB) {
        const idA = recordA[TASK_ORIGINAL_ID_INDEX];
        const idB = recordB[TASK_ORIGINAL_ID_INDEX];
        return idA - idB;
    } else {
        return timeB - timeA;
    }
});

const finalWinnerId = taskRecords[0][TASK_ORIGINAL_ID_INDEX] + 1;
console.log(finalWinnerId);
