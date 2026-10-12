function processCardGameResults(inputContent) {
    const allInputTokens = inputContent.trim().split(/\s|\n/);

    const numberOfRounds = parseInt(allInputTokens[0]);

    const roundCardPairs = Array.from({ length: numberOfRounds }, (_, index) => {
        const playerOneValue = allInputTokens[1 + index * 2];
        const playerTwoValue = allInputTokens[1 + index * 2 + 1];
        return [playerOneValue, playerTwoValue];
    });

    const finalScoreAccumulator = roundCardPairs.reduce((currentTotalScores, currentRoundCards) => {
        let [playerOneCurrentScore, playerTwoCurrentScore] = currentTotalScores;
        const [cardAString, cardBString] = currentRoundCards;

        const cardA = parseInt(cardAString);
        const cardB = parseInt(cardBString);

        const [incrementA, incrementB] =
            (cardA === cardB) ? [1, 1] :
            (cardA < cardB) ? [0, 3] :
            [3, 0];

        playerOneCurrentScore += incrementA;
        playerTwoCurrentScore += incrementB;

        return [playerOneCurrentScore, playerTwoCurrentScore];
    }, [0, 0]);

    console.log(finalScoreAccumulator[0] + " " + finalScoreAccumulator[1]);
}

processCardGameResults(require("fs").readFileSync("/dev/stdin", "utf8"));
