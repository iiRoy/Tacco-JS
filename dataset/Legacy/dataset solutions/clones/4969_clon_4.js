'use strict';

const processGameData = (sourceText) => {
    const lineSegments = sourceText.split('\n').map(segment => segment.split(''));
    return new Map([
        ['a', lineSegments[0]],
        ['b', lineSegments[1]],
        ['c', lineSegments[2]]
    ]);
};

const resolveGameOutcome = (initialParticipant, participantDecks) => {
    const validParticipantKeys = ['a', 'b', 'c'];

    const conductRound = (currentParticipantIdentifier, currentDeckStates) => {
        const effectiveParticipantKey = validParticipantKeys.includes(currentParticipantIdentifier)
            ? currentParticipantIdentifier
            : 'c';

        const activeDeck = currentDeckStates.get(effectiveParticipantKey);

        if (activeDeck.length === 0) {
            return currentParticipantIdentifier.toUpperCase();
        }

        const nextParticipantIdentifier = activeDeck.shift();
        return conductRound(nextParticipantIdentifier, currentDeckStates);
    };

    return conductRound(initialParticipant, participantDecks);
};

const initiateGame = (rawData) => {
    const gameDecks = processGameData(rawData);
    const firstParticipant = 'a';
    const winningParticipant = resolveGameOutcome(firstParticipant, gameDecks);
    console.log(winningParticipant);
};

initiateGame(require('fs').readFileSync('/dev/stdin', 'utf-8'));
