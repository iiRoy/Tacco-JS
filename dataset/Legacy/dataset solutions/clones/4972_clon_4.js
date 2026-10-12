"use strict";

const executeGameLogic = (inputLines) => {
    const playerDecks = new Map();
    playerDecks.set('a', inputLines[0].split(''));
    playerDecks.set('b', inputLines[1].split(''));
    playerDecks.set('c', inputLines[2].split(''));

    const playRound = (activePlayerKey) => {
        const currentDeck = playerDecks.get(activePlayerKey);

        if (currentDeck.length === 0) {
            console.log(activePlayerKey.toUpperCase());
            return;
        }

        const nextPlayerKey = currentDeck.shift();
        playRound(nextPlayerKey);
    };

    playRound('a');
};

const processInputAndRun = (rawInput) => {
    const parsedLines = rawInput.trim().split("\n");
    executeGameLogic(parsedLines);
};

processInputAndRun(require('fs').readFileSync('/dev/stdin', 'utf8'));
