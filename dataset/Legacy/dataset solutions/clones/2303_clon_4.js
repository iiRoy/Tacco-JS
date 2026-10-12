'use strict';

function processGame(rawInputData) {
  const lines = rawInputData.trim().split('\n');

  const gameParameters = lines[0].split(' ').map(Number);
  const totalRounds = gameParameters[0];
  const penaltyWindow = gameParameters[1];

  const pointValues = lines[1].split(' ').map(Number);
  const rockWinPoints = pointValues[0];
  const scissorsWinPoints = pointValues[1];
  const paperWinPoints = pointValues[2];

  const playerMoves = lines[2];

  const moveOutcomePoints = {
    'r': paperWinPoints,
    's': rockWinPoints,
    'p': scissorsWinPoints
  };

  const finalScoreAccumulator = Array.from({ length: totalRounds }).reduce((acc, _, roundIndex) => {
    const currentMoveChoice = playerMoves[roundIndex];
    let currentRoundEarnedPoints = 0;

    const previousPenaltyCheckIndex = roundIndex - penaltyWindow;

    const isPenaltyTriggered = (
      previousPenaltyCheckIndex >= 0 &&
      playerMoves[previousPenaltyCheckIndex] === currentMoveChoice &&
      acc.roundScoreHistory[previousPenaltyCheckIndex] > 0
    );

    if (!isPenaltyTriggered) {
      currentRoundEarnedPoints = moveOutcomePoints[currentMoveChoice];
    }

    acc.cumulativeTotal += currentRoundEarnedPoints;
    acc.roundScoreHistory.push(currentRoundEarnedPoints);

    return acc;
  }, { cumulativeTotal: 0, roundScoreHistory: [] });

  console.log(finalScoreAccumulator.cumulativeTotal);
}

processGame(require("fs").readFileSync("/dev/stdin", "utf8"));
