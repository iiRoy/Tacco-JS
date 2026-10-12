"use strict";

const executeGameLogic = (rawInput) => {
    const processedLines = rawInput.trim().split("\n");

    const playerAChars = processedLines[0].split("");
    const playerBChars = processedLines[1].split("");
    const playerCChars = processedLines[2].split("");

    const playerCharacterQueues = {
        'a': playerAChars,
        'b': playerBChars,
        'c': playerCChars
    };

    let currentTurnPlayer = "a";

    while (true) {
        const activePlayerQueue = playerCharacterQueues[currentTurnPlayer];

        if (activePlayerQueue.length === 0) {
            const winnerIdentifier = currentTurnPlayer.toUpperCase();
            console.log(winnerIdentifier);
            return;
        }

        const nextPlayerDesignator = activePlayerQueue.shift();
        currentTurnPlayer = nextPlayerDesignator;
    }
};

executeGameLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
