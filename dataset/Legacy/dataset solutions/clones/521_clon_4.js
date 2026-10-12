const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');

const lines = rawInput.trim().split("\n");

const [entityCount, timeLimit] = lines.shift().split(" ").map(Number);

const rawEvents = lines.map(line => line.split(" ").map(Number));
rawEvents.push([1, timeLimit, 0]); // Add the dummy event as in the original

const processedEvents = rawEvents.map(event => [event[0] - 1, event[1], event[2]]);

const initialProcessingState = {
    entities: Array.from({ length: entityCount }, (_, i) => ({
        identifier: i,
        currentValue: 0,
        totalAccumulatedTime: 0
    })),
    lastEventTime: 0,
    currentMaxIndex: 0,
    currentMaxValue: 0
};

const findTrueLeader = (entityCollection) => {
    let topValue = -1;
    let topIndex = -1;

    for (let i = 0; i < entityCollection.length; i++) {
        const currentEntity = entityCollection[i];
        if (currentEntity.currentValue > topValue) {
            topValue = currentEntity.currentValue;
            topIndex = i;
        } else if (currentEntity.currentValue === topValue) {
            if (i < topIndex) {
                topIndex = i;
            }
        }
    }
    return { index: topIndex, value: topValue };
};

const processEvent = (state, eventData) => {
    const { entities, lastEventTime, currentMaxIndex, currentMaxValue } = state;
    const [entityIndexAffected, eventTimestamp, valueDelta] = eventData;

    const updatedEntities = entities.map(e => ({ ...e }));

    if (currentMaxIndex !== -1) {
        updatedEntities[currentMaxIndex].totalAccumulatedTime += (eventTimestamp - lastEventTime);
    }

    updatedEntities[entityIndexAffected].currentValue += valueDelta;

    let nextMaxIndex = currentMaxIndex;
    let nextMaxValue = currentMaxValue;

    if (valueDelta > 0) {
        if (updatedEntities[entityIndexAffected].currentValue > nextMaxValue) {
            nextMaxIndex = entityIndexAffected;
            nextMaxValue = updatedEntities[entityIndexAffected].currentValue;
        } else if (updatedEntities[entityIndexAffected].currentValue === nextMaxValue && entityIndexAffected <= nextMaxIndex) {
            nextMaxIndex = entityIndexAffected;
            nextMaxValue = updatedEntities[entityIndexAffected].currentValue;
        }
    } else if (valueDelta < 0) {
        const trueLeader = findTrueLeader(updatedEntities);
        nextMaxIndex = trueLeader.index;
        nextMaxValue = trueLeader.value;
    }

    return {
        entities: updatedEntities,
        lastEventTime: eventTimestamp,
        currentMaxIndex: nextMaxIndex,
        currentMaxValue: nextMaxValue
    };
};

const finalState = processedEvents.reduce(processEvent, initialProcessingState);

const sortedEntities = [...finalState.entities];

sortedEntities.sort((a, b) => {
    if (a.totalAccumulatedTime === b.totalAccumulatedTime) {
        return a.identifier - b.identifier;
    }
    return b.totalAccumulatedTime - a.totalAccumulatedTime;
});

console.log(sortedEntities[0].identifier + 1);
