const fileSystem = require('fs');
let rawInputData;
try {
    rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    console.error("Error reading input from /dev/stdin:", error.message);
    process.exit(1);
}

if (!rawInputData || rawInputData.trim() === '') {
    console.error("Input data is empty or invalid.");
    process.exit(1);
}

const eventDescriptionLines = rawInputData.trim().split('\n').filter(line => line.length > 0);

if (eventDescriptionLines.length === 0) {
    console.error("No event lines found after initial parsing.");
    process.exit(1);
}

const firstLine = eventDescriptionLines.shift();
const configurationParameters = firstLine.split(' ').map(Number);

if (configurationParameters.length < 3 || isNaN(configurationParameters[0]) || isNaN(configurationParameters[2])) {
    console.error("Invalid configuration line format. Expected N and L parameters.");
    process.exit(1);
}

const numberOfEntities = configurationParameters[0];
const finalSimulationTime = configurationParameters[2];

const initializeEntityRecords = (count) => {
    const records = [];
    for (let i = 0; i < count; i++) {
        records.push({
            entityId: i,
            currentScore: 0,
            accumulatedDuration: 0,
            originalIndex: i
        });
    }
    return records;
};

const entityRecords = initializeEntityRecords(numberOfEntities);
let currentDominator = {
    id: 0,
    score: 0
};
let previousEventTime = 0;

const endSimulationEvent = {
    targetId: 0,
    timestamp: finalSimulationTime,
    scoreModifier: 0
};

eventDescriptionLines.push(`${endSimulationEvent.targetId + 1} ${endSimulationEvent.timestamp} ${endSimulationEvent.scoreModifier}`);

const determineCurrentLeader = (records) => {
    if (records.length === 0) {
        return { id: -1, score: -Infinity }; // No entities, no leader
    }

    const leaderCandidate = records.reduce((leader, entity) => {
        if (entity.currentScore > leader.score) {
            return { id: entity.entityId, score: entity.currentScore };
        } else if (entity.currentScore === leader.score) {
            if (entity.entityId < leader.id) {
                return { id: entity.entityId, score: entity.currentScore };
            }
        }
        return leader;
    }, { id: records[0].entityId, score: records[0].currentScore });

    return leaderCandidate;
};

eventDescriptionLines.forEach((eventLineString, index) => {
    const parsedValues = eventLineString.split(' ').map(Number);

    if (parsedValues.length !== 3 || parsedValues.some(isNaN)) {
        console.warn(`Skipping malformed event line at index ${index}: "${eventLineString}"`);
        return;
    }

    const affectedEntityIndex = parsedValues[0] - 1;
    const eventTime = parsedValues[1];
    const scoreModifierValue = parsedValues[2];

    if (affectedEntityIndex < 0 || affectedEntityIndex >= numberOfEntities) {
        console.warn(`Event ${index}: Invalid entity ID ${parsedValues[0]}. Skipping.`);
        return;
    }
    if (eventTime < previousEventTime) {
        console.warn(`Event ${index}: Time travel detected! Event time ${eventTime} is before previous event time ${previousEventTime}. Skipping.`);
        return;
    }

    const timeElapsedSinceLastEvent = eventTime - previousEventTime;
    if (timeElapsedSinceLastEvent > 0) {
        entityRecords[currentDominator.id].accumulatedDuration += timeElapsedSinceLastEvent;
    }

    previousEventTime = eventTime;

    entityRecords[affectedEntityIndex].currentScore += scoreModifierValue;

    let needsFullLeaderScan = false;

    if (scoreModifierValue > 0) {
        const affectedEntity = entityRecords[affectedEntityIndex];
        if (affectedEntity.currentScore > currentDominator.score ||
            (affectedEntity.currentScore === currentDominator.score && affectedEntity.entityId < currentDominator.id)) {
            currentDominator = { id: affectedEntity.entityId, score: affectedEntity.currentScore };
        }
    } else if (scoreModifierValue < 0 && affectedEntityIndex === currentDominator.id) {
        needsFullLeaderScan = true;
    }

    if (needsFullLeaderScan) {
        currentDominator = determineCurrentLeader(entityRecords);
    }
});

if (entityRecords.length === 0) {
    console.error("No entity records to sort. Exiting.");
    process.exit(1);
}

entityRecords.sort((entityA, entityB) => {
    if (entityA.accumulatedDuration !== entityB.accumulatedDuration) {
        return entityB.accumulatedDuration - entityA.accumulatedDuration;
    }
    return entityA.originalIndex - entityB.originalIndex;
});

console.log(entityRecords[0].originalIndex + 1);