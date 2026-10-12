const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const eventLines = rawData.trim().split("\n");

const configParams = eventLines.shift().split(" ").map(Number);
const entityCount = configParams[0];
const finalMoment = configParams[2];

const parsedEvents = eventLines.map(line => {
    const parts = line.split(" ").map(Number);
    return {
        targetId: parts[0] - 1,
        moment: parts[1],
        change: parts[2]
    };
});

parsedEvents.push({ targetId: 0, moment: finalMoment, change: 0 });

const initialSystemState = {
    entityRecords: Array.from({ length: entityCount }, (_, i) => ({
        currentVal: 0,
        totalTime: 0,
        originalId: i
    })),
    activeLeaderId: 0,
    leaderValue: 0,
    lastProcessedTime: 0
};

const processSystemEvent = (currentState, currentEvent) => {
    const { entityRecords, activeLeaderId, leaderValue, lastProcessedTime } = currentState;

    entityRecords[activeLeaderId].totalTime += currentEvent.moment - lastProcessedTime;

    entityRecords[currentEvent.targetId].currentVal += currentEvent.change;

    let newLeaderId = activeLeaderId;
    let newLeaderValue = leaderValue;

    if (currentEvent.change > 0) {
        if (entityRecords[currentEvent.targetId].currentVal > newLeaderValue) {
            newLeaderValue = entityRecords[currentEvent.targetId].currentVal;
            newLeaderId = currentEvent.targetId;
        } else if (entityRecords[currentEvent.targetId].currentVal === newLeaderValue && currentEvent.targetId < newLeaderId) {
            newLeaderId = currentEvent.targetId;
        }
    } else if (currentEvent.change < 0 && currentEvent.targetId === activeLeaderId) {
        newLeaderValue = 0;
        newLeaderId = 0;
        for (let scanIdx = 0; scanIdx < entityRecords.length; scanIdx++) {
            if (entityRecords[scanIdx].currentVal > newLeaderValue) {
                newLeaderValue = entityRecords[scanIdx].currentVal;
                newLeaderId = scanIdx;
            } else if (entityRecords[scanIdx].currentVal === newLeaderValue && scanIdx < newLeaderId) {
                newLeaderId = scanIdx;
            }
        }
    }

    currentState.activeLeaderId = newLeaderId;
    currentState.leaderValue = newLeaderValue;
    currentState.lastProcessedTime = currentEvent.moment;

    return currentState;
};

const finalSystemState = parsedEvents.reduce(processSystemEvent, initialSystemState);

finalSystemState.entityRecords.sort((recordA, recordB) => {
    if (recordA.totalTime === recordB.totalTime) {
        return recordA.originalId - recordB.originalId;
    } else {
        return recordB.totalTime - recordA.totalTime;
    }
});

console.log(finalSystemState.entityRecords[0].originalId + 1);
