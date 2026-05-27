var fileSystem = require('fs');
var rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

var inputLines = rawInput.trim().split("\n");
var initialConfig = inputLines.shift().split(" ").map(Number);

var totalEntities = initialConfig[0];
var finalEventBoundary = initialConfig[2];

var eventStream = inputLines.map(line => line.split(" ").map(Number));
eventStream.push([1, finalEventBoundary, 0]); // Append the concluding event

var processingInitialState = {
    entityRecords: new Map(Array.from({ length: totalEntities }, (_, idx) => [idx, { currentVal: 0, totalTimeAsLeader: 0 }])),
    leaderEntityId: 0,
    leaderEntityValue: 0,
    lastProcessedTime: 0
};

const processEventStep = (currentState, eventDetails) => {
    const [entityIdOneBased, eventMoment, valueAdjustment] = eventDetails;
    const affectedEntityId = entityIdOneBased - 1;

    const timeElapsed = eventMoment - currentState.lastProcessedTime;

    // Accumulate time for the entity that was leading until this event
    const currentLeaderRecord = currentState.entityRecords.get(currentState.leaderEntityId);
    currentLeaderRecord.totalTimeAsLeader += timeElapsed;

    // Update the value for the entity involved in this event
    const affectedEntityRecord = currentState.entityRecords.get(affectedEntityId);
    affectedEntityRecord.currentVal += valueAdjustment;

    let nextLeaderId = currentState.leaderEntityId;
    let nextLeaderValue = currentState.leaderEntityValue;

    if (valueAdjustment > 0) {
        // If value increased, check if it becomes the new leader
        if (affectedEntityRecord.currentVal > nextLeaderValue) {
            nextLeaderId = affectedEntityId;
            nextLeaderValue = affectedEntityRecord.currentVal;
        } else if (affectedEntityRecord.currentVal === nextLeaderValue && affectedEntityId <= nextLeaderId) {
            // Tie-breaking: smaller ID wins if values are equal
            nextLeaderId = affectedEntityId;
            nextLeaderValue = affectedEntityRecord.currentVal;
        }
    } else if (valueAdjustment < 0 && affectedEntityId === currentState.leaderEntityId) {
        // If the current leader's value decreased, re-evaluate the global leader
        let highestValueFound = -Infinity;
        let highestValueId = -1;

        for (const [entityKey, entityData] of currentState.entityRecords.entries()) {
            if (entityData.currentVal > highestValueFound) {
                highestValueFound = entityData.currentVal;
                highestValueId = entityKey;
            } else if (entityData.currentVal === highestValueFound && entityKey < highestValueId) {
                // Tie-breaking: smaller ID wins if values are equal
                highestValueId = entityKey;
            }
        }
        nextLeaderId = highestValueId;
        nextLeaderValue = highestValueFound;
    }

    return {
        entityRecords: currentState.entityRecords, // Map is modified in place
        leaderEntityId: nextLeaderId,
        leaderEntityValue: nextLeaderValue,
        lastProcessedTime: eventMoment
    };
};

var finalProcessingState = eventStream.reduce(processEventStep, processingInitialState);

let maximumLeadTime = -1;
let entityWithMostLeadTime = -1;

for (const [entityIdentifier, entityInformation] of finalProcessingState.entityRecords.entries()) {
    if (entityInformation.totalTimeAsLeader > maximumLeadTime) {
        maximumLeadTime = entityInformation.totalTimeAsLeader;
        entityWithMostLeadTime = entityIdentifier;
    }
}

console.log(entityWithMostLeadTime + 1);
