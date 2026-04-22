const fileSystemAccessor = require('fs');
const acquiredContent = fileSystemAccessor.readFileSync('/dev/stdin', 'utf8');
const processedLines = acquiredContent.trim().split('\n');

const initialConfiguration = processedLines.shift().split(' ').map(Number);
const participantCount = initialConfiguration[0];
const totalDurationLimit = initialConfiguration[2];

const prepareInitialRegistry = (count) => {
    const initialParticipants = new Map();
    for (let i = 0; i < count; ++i) {
        initialParticipants.set(i, { scoreValue: 0, accumulatedTime: 0, originalIndex: i });
    }
    return {
        activeParticipants: initialParticipants,
        currentDominantIndex: 0,
        currentDominantScore: 0,
        currentElapsedMoment: 0
    };
};

const evolveStateWithEvent = (previousState, currentEvent) => {
    const { activeParticipants, currentDominantIndex, currentDominantScore, currentElapsedMoment } = previousState;
    const { affectedParticipantIndex, eventTimestamp, scoreModification } = currentEvent;

    const modifiedParticipants = new Map(activeParticipants);

    const dominantBeforeEvent = modifiedParticipants.get(currentDominantIndex);
    if (dominantBeforeEvent) {
        modifiedParticipants.set(currentDominantIndex, {
            ...dominantBeforeEvent,
            accumulatedTime: dominantBeforeEvent.accumulatedTime + (eventTimestamp - currentElapsedMoment)
        });
    }

    const targetParticipant = modifiedParticipants.get(affectedParticipantIndex);
    if (targetParticipant) {
        modifiedParticipants.set(affectedParticipantIndex, {
            ...targetParticipant,
            scoreValue: targetParticipant.scoreValue + scoreModification
        });
    }

    let nextDominantIndex = currentDominantIndex;
    let nextDominantScore = currentDominantScore;

    if (scoreModification > 0) {
        const valueOfTarget = modifiedParticipants.get(affectedParticipantIndex).scoreValue;
        if (valueOfTarget > nextDominantScore) {
            nextDominantIndex = affectedParticipantIndex;
            nextDominantScore = valueOfTarget;
        } else if (valueOfTarget === nextDominantScore && affectedParticipantIndex < nextDominantIndex) {
            nextDominantIndex = affectedParticipantIndex;
        }
    } else if (scoreModification < 0) {
        if (affectedParticipantIndex === nextDominantIndex) {
            nextDominantScore = 0; 
            nextDominantIndex = 0; 

            for (const participant of modifiedParticipants.values()) {
                if (participant.scoreValue > nextDominantScore) {
                    nextDominantScore = participant.scoreValue;
                    nextDominantIndex = participant.originalIndex;
                } else if (participant.scoreValue === nextDominantScore && participant.originalIndex < nextDominantIndex) {
                    nextDominantIndex = participant.originalIndex;
                }
            }
        }
    }

    return {
        activeParticipants: modifiedParticipants,
        currentDominantIndex: nextDominantIndex,
        currentDominantScore: nextDominantScore,
        currentElapsedMoment: eventTimestamp
    };
};

const rawEventRecords = [...processedLines, [1, totalDurationLimit, 0].join(' ')];

const structuredEventObjects = rawEventRecords.map(recordString => {
    const components = recordString.split(' ').map(Number);
    return {
        affectedParticipantIndex: components[0] - 1,
        eventTimestamp: components[1],
        scoreModification: components[2]
    };
});

const finalSystemState = structuredEventObjects.reduce(evolveStateWithEvent, prepareInitialRegistry(participantCount));

const finalParticipantList = Array.from(finalSystemState.activeParticipants.values());

finalParticipantList.sort((elementA, elementB) => {
    if (elementA.accumulatedTime === elementB.accumulatedTime) {
        return elementA.originalIndex - elementB.originalIndex;
    }
    return elementB.accumulatedTime - elementA.accumulatedTime;
});

console.log(finalParticipantList[0].originalIndex + 1);