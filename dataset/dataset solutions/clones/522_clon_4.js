const fileContent = require('node:fs').readFileSync(0, 'utf8');
const allLines = fileContent.trim().split('\n');
const initialParameters = allLines.shift().split(' ').map(Number);
const countOfEntities = initialParameters[0];
const finalPeriod = initialParameters[2];
let initialParticipants = Array.from({ length: countOfEntities }, (_, idx) => ({
    identifier: idx,
    currentScore: 0,
    totalActivePeriod: 0
}));
const initialState = {
    participants: initialParticipants,
    dominantEntity: { id: 0, score: 0 },
    currentMoment: 0
};
allLines.push([1, finalPeriod, 0].join(' '));
const processEvent = (currentState, eventLine) => {
    const newState = {
        participants: currentState.participants.map(p => ({ ...p })),
        dominantEntity: { ...currentState.dominantEntity },
        currentMoment: currentState.currentMoment
    };
    const eventDetails = eventLine.split(' ').map(Number);
    const actorIdentifier = eventDetails[0] - 1;
    const eventTime = eventDetails[1];
    const scoreChange = eventDetails[2];
    const durationSinceLastEvent = eventTime - newState.currentMoment;
    newState.participants[newState.dominantEntity.id].totalActivePeriod += durationSinceLastEvent;
    newState.currentMoment = eventTime;
    newState.participants[actorIdentifier].currentScore += scoreChange;
    const affectedParticipant = newState.participants[actorIdentifier];
    if (scoreChange > 0) {
        if (affectedParticipant.currentScore > newState.dominantEntity.score) {
            newState.dominantEntity = { id: actorIdentifier, score: affectedParticipant.currentScore };
        } else if (affectedParticipant.currentScore === newState.dominantEntity.score && actorIdentifier < newState.dominantEntity.id) {
            newState.dominantEntity = { id: actorIdentifier, score: affectedParticipant.currentScore };
        }
    } else if (scoreChange < 0 && actorIdentifier === newState.dominantEntity.id) {
        let newDominantId = newState.participants[0].identifier;
        let newDominantScore = newState.participants[0].currentScore;
        for (let pIdx = 1; pIdx < newState.participants.length; pIdx++) {
            const p = newState.participants[pIdx];
            if (p.currentScore > newDominantScore) {
                newDominantScore = p.currentScore;
                newDominantId = p.identifier;
            } else if (p.currentScore === newDominantScore && p.identifier < newDominantId) {
                newDominantId = p.identifier;
            }
        }
        newState.dominantEntity = { id: newDominantId, score: newDominantScore };
    }
    return newState;
};
const finalState = allLines.reduce(processEvent, initialState);
let highestDuration = -1;
let winnerIdentifier = -1;
finalState.participants.forEach(p => {
    if (p.totalActivePeriod > highestDuration) {
        highestDuration = p.totalActivePeriod;
        winnerIdentifier = p.identifier;
    }
});
console.log(winnerIdentifier + 1);