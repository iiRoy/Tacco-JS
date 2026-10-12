let dataBuffer = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(chunk) {
  dataBuffer += chunk;
});

process.stdin.on('end', function() {
  const parsedLines = dataBuffer.split("\n");

  const gameCount = parseInt(parsedLines[0], 10);

  const determineRoundOutcome = (firstCompetitorCard, secondCompetitorCard) => {
    const outcomeIdentifier = firstCompetitorCard === secondCompetitorCard
      ? 'tie'
      : (firstCompetitorCard > secondCompetitorCard ? 'firstPlayerWins' : 'secondPlayerWins');

    const pointAllocation = {
      'firstPlayerWins': { p1: 3, p2: 0 },
      'secondPlayerWins': { p1: 0, p2: 3 },
      'tie': { p1: 1, p2: 1 }
    };
    return pointAllocation[outcomeIdentifier];
  };

  const initialScoreState = { playerOneScore: 0, playerTwoScore: 0 };

  const gameRounds = parsedLines.slice(1, gameCount + 1);

  const finalScoreState = gameRounds.reduce((scoreAccumulator, currentMatchup) => {
    const [firstCompetitorCard, secondCompetitorCard] = currentMatchup.split(" ");
    const roundContribution = determineRoundOutcome(firstCompetitorCard, secondCompetitorCard);

    scoreAccumulator.playerOneScore += roundContribution.p1;
    scoreAccumulator.playerTwoScore += roundContribution.p2;

    return scoreAccumulator;
  }, initialScoreState);

  console.log(finalScoreState.playerOneScore, finalScoreState.playerTwoScore);
});
