process.stdin.on("data", function(inputChunk) {
    const gameRounds = String(inputChunk).trim().split("\n").slice(1);

    const outcomePointsMap = {
        '0': [1, 1],
        '1': [3, 0],
        '-1': [0, 3]
    };

    const finalScores = gameRounds.reduce((currentScores, roundEntry) => {
        const [playerOneVal, playerTwoVal] = roundEntry.split(" ");

        let comparisonIndicator;
        if (playerOneVal === playerTwoVal) {
            comparisonIndicator = 0;
        } else if (playerOneVal > playerTwoVal) {
            comparisonIndicator = 1;
        } else {
            comparisonIndicator = -1;
        }

        const [pointsForP1, pointsForP2] = outcomePointsMap[comparisonIndicator];

        currentScores[0] += pointsForP1;
        currentScores[1] += pointsForP2;

        return currentScores;
    }, [0, 0]);

    console.log(finalScores[0], finalScores[1]);
}).resume();
