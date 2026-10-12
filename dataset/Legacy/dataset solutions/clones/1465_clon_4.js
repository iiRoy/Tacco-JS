function processGameData(inputLines) {
    const totalRounds = parseInt(inputLines[0], 10);
    const gameRecords = inputLines.slice(1, totalRounds + 1);

    const determineRoundOutcome = (playerACard, playerBCard) => {
        if (playerACard === playerBCard) return 'DRAW';
        if (playerACard > playerBCard) return 'PLAYER_A_WINS';
        return 'PLAYER_B_WINS';
    };

    const pointAllocation = {
        'DRAW': [1, 1],
        'PLAYER_A_WINS': [3, 0],
        'PLAYER_B_WINS': [0, 3]
    };

    const finalTally = gameRecords.reduce((currentScores, roundEntry) => {
        const [cardAValue, cardBValue] = roundEntry.split(/\s+/);
        const outcomeKey = determineRoundOutcome(cardAValue, cardBValue);
        const [pointsForA, pointsForB] = pointAllocation[outcomeKey];

        return {
            playerA: currentScores.playerA + pointsForA,
            playerB: currentScores.playerB + pointsForB
        };
    }, { playerA: 0, playerB: 0 });

    console.log(finalTally.playerA, finalTally.playerB);
}

let inputSegments = [];
process.stdin.on('data', (dataFragment) => {
    inputSegments.push(dataFragment);
});

process.stdin.on('end', () => {
    const allInputLines = inputSegments.join('').split('\n');
    processGameData(allInputLines);
});
