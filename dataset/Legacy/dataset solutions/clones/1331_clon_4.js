(function(rawData) {
    const lineSegments = rawData.split('\n');
    const initialCount = Number(lineSegments.shift());

    const determineRoundPoints = (playerACard, playerBCard) => {
        const comparisonResult = playerACard.localeCompare(playerBCard);
        const scoreMapping = {
            '-1': [0, 3], // playerACard < playerBCard
            '0': [1, 1],  // playerACard == playerBCard
            '1': [3, 0]   // playerACard > playerBCard
        };
        return scoreMapping[comparisonResult.toString()];
    };

    const accumulatedScores = lineSegments.slice(0, 3).reduce((currentTotals, matchEntry) => {
        const [cardAValue, cardBValue] = matchEntry.split(' ');
        const [scoreAIncrement, scoreBIncrement] = determineRoundPoints(cardAValue, cardBValue);
        currentTotals[0] += scoreAIncrement;
        currentTotals[1] += scoreBIncrement;
        return currentTotals;
    }, [0, 0]);

    console.log('%s %s', accumulatedScores[0], accumulatedScores[1]);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
