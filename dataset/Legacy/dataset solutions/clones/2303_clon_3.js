'use strict';

const parseNumericValues = (stringArray) => stringArray.map(item => parseInt(item, 10));

const calculateWinningScore = (moveType, rockWinValue, scissorsWinValue, paperWinValue) => {
    switch (moveType) {
        case 'r': return paperWinValue;
        case 's': return rockWinValue;
        case 'p': return scissorsWinValue;
        default: return 0;
    }
};

function ProcessGameLogic(rawInputData) {
    const inputLines = rawInputData.trim().split('\n');

    const firstLineData = parseNumericValues(inputLines[0].split(' '));
    const totalGameRounds = firstLineData[0];
    const repeatPenaltyPeriod = firstLineData[1];

    const secondLineData = parseNumericValues(inputLines[1].split(' '));
    const scoreForWinningWithRock = secondLineData[0];
    const scoreForWinningWithScissors = secondLineData[1];
    const scoreForWinningWithPaper = secondLineData[2];

    const gameMoveSequence = inputLines[2];

    const roundResultScores = [];

    for (let roundCounter = 0; roundCounter < totalGameRounds; ++roundCounter) {
        const currentRoundMove = gameMoveSequence[roundCounter];
        let scoreEarnedThisRound = 0;

        const isWithinPenaltyRange = roundCounter >= repeatPenaltyPeriod;
        if (isWithinPenaltyRange) {
            const previousMoveInSequence = gameMoveSequence[roundCounter - repeatPenaltyPeriod];
            const previousRoundScore = roundResultScores[roundCounter - repeatPenaltyPeriod];

            const isMovePenalized = (previousMoveInSequence === currentRoundMove && previousRoundScore > 0);

            if (!isMovePenalized) {
                scoreEarnedThisRound = calculateWinningScore(
                    currentRoundMove,
                    scoreForWinningWithRock,
                    scoreForWinningWithScissors,
                    scoreForWinningWithPaper
                );
            }
        } else {
            scoreEarnedThisRound = calculateWinningScore(
                currentRoundMove,
                scoreForWinningWithRock,
                scoreForWinningWithScissors,
                scoreForWinningWithPaper
            );
        }
        roundResultScores.push(scoreEarnedThisRound);
    }

    const sumAllScores = (accumulator, currentValue) => accumulator + currentValue;
    console.log(roundResultScores.reduce(sumAllScores, 0));
}

ProcessGameLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
