const process = require('fs');

const sourceData = process.readFileSync('/dev/stdin', 'utf8');
let eventLogEntries = sourceData.trim().split("\n");

const initialConfiguration = eventLogEntries.shift().split(" ").map(Number);
const participantCount = initialConfiguration[0];
const terminalTimestamp = initialConfiguration[2];

const parsedEvents = eventLogEntries.map(entry => entry.split(" ").map(Number));
parsedEvents.push([1, terminalTimestamp, 0]); // Append the final state-closing event

const initialSystemSnapshot = {
    participants: Array.from({ length: participantCount }, (_, participantIdx) => ({
        scoreValue: 0,
        accumulatedTime: 0,
        initialOrder: participantIdx
    })),
    currentTimestamp: 0,
    dominantParticipantIndex: 0 // Participant at index 0 is the initial leader by tie-breaking rule
};

const systemEvolutionReducer = (currentSnapshot, eventDetails) => {
    const [oneBasedParticipantId, eventTimestamp, scoreDelta] = eventDetails;
    const zeroBasedParticipantIndex = oneBasedParticipantId - 1;

    // 1. Distribute elapsed time to the currently dominant participant
    const timeInterval = eventTimestamp - currentSnapshot.currentTimestamp;
    currentSnapshot.participants[currentSnapshot.dominantParticipantIndex].accumulatedTime += timeInterval;

    // 2. Update the score of the participant involved in the event
    currentSnapshot.participants[zeroBasedParticipantIndex].scoreValue += scoreDelta;

    // 3. Re-evaluate and determine the new dominant participant based on current scores
    let candidateLeaderIndex = 0;
    for (let i = 0; i < currentSnapshot.participants.length; i++) {
        const currentCandidate = currentSnapshot.participants[i];
        const establishedLeader = currentSnapshot.participants[candidateLeaderIndex];

        if (currentCandidate.scoreValue > establishedLeader.scoreValue) {
            candidateLeaderIndex = i;
        } else if (currentCandidate.scoreValue === establishedLeader.scoreValue) {
            // Tie-breaking rule: lower initial order wins
            if (currentCandidate.initialOrder < establishedLeader.initialOrder) {
                candidateLeaderIndex = i;
            }
        }
    }
    currentSnapshot.dominantParticipantIndex = candidateLeaderIndex;

    // 4. Advance the system's current timestamp
    currentSnapshot.currentTimestamp = eventTimestamp;

    return currentSnapshot;
};

const finalSystemState = parsedEvents.reduce(systemEvolutionReducer, initialSystemSnapshot);

// Sort participants to find the ultimate winner
finalSystemState.participants.sort((participantA, participantB) => {
    if (participantA.accumulatedTime === participantB.accumulatedTime) {
        return participantA.initialOrder - participantB.initialOrder; // Ascending initial order for ties
    }
    return participantB.accumulatedTime - participantA.accumulatedTime; // Descending accumulated time
});

console.log(finalSystemState.participants[0].initialOrder + 1);
