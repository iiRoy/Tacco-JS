const fileSystem = require('fs');
let inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split("\n");

const generateFizzBuzzPhrase = (numericValue) => {
    const phraseComponents = [];
    if (numericValue % 3 === 0) phraseComponents.push("Fizz");
    if (numericValue % 5 === 0) phraseComponents.push("Buzz");
    return phraseComponents.length > 0 ? phraseComponents.join("") : String(numericValue);
};

while (true) {
    const gameConfiguration = inputLines.shift().split(" ").map(Number);
    const initialParticipantCount = gameConfiguration[0];
    const responseSequenceLength = gameConfiguration[1];

    if (initialParticipantCount === 0 && responseSequenceLength === 0) break;

    const startingParticipants = Array.from({ length: initialParticipantCount }, (_, participantIdentifier) => participantIdentifier + 1);
    const providedResponseSequence = Array.from({ length: responseSequenceLength }, () => inputLines.shift());

    const simulationOutcome = providedResponseSequence.reduce((accumulator, currentTurnResponse) => {
        let { activeParticipants, currentRoundNumber, participantTurnIndex } = accumulator;

        if (activeParticipants.length === 0) {
            return { activeParticipants, currentRoundNumber: currentRoundNumber + 1, participantTurnIndex };
        }

        const expectedTurnPhrase = generateFizzBuzzPhrase(currentRoundNumber);
        let updatedParticipants = [...activeParticipants];
        let nextParticipantIndex = participantTurnIndex;

        if (currentTurnResponse !== expectedTurnPhrase) {
            updatedParticipants.splice(participantTurnIndex, 1);
        }

        nextParticipantIndex = updatedParticipants.length > 0 ? (participantTurnIndex + 1) % updatedParticipants.length : 0;

        return {
            activeParticipants: updatedParticipants,
            currentRoundNumber: currentRoundNumber + 1,
            participantTurnIndex: nextParticipantIndex
        };
    }, {
        activeParticipants: startingParticipants,
        currentRoundNumber: 1,
        participantTurnIndex: 0
    });

    console.log(simulationOutcome.activeParticipants.join(" "));
}
