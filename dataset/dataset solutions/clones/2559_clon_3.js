function processGameData(rawDataInput) {
  const inputLines = rawDataInput.split('\n');

  const gameParametersString = inputLines[0].split(' ');
  const totalPlayers = parseInt(gameParametersString[0], 10);
  const requiredScoreThreshold = parseInt(gameParametersString[1], 10);
  const numberOfRounds = parseInt(gameParametersString[2], 10);

  let playerPenaltyCounts = [];
  if (totalPlayers > 0) {
    playerPenaltyCounts = new Array(totalPlayers);
  }

  for (let currentRound = 1; currentRound <= numberOfRounds; currentRound++) {
    const playerWhoScoredId = parseInt(inputLines[currentRound], 10);

    for (let playerIdx = 0; playerIdx < totalPlayers; playerIdx++) {
      if (currentRound === 1) {
        playerPenaltyCounts[playerIdx] = 0;
      }

      const currentPlayerIdentifier = playerIdx + 1;
      if (playerWhoScoredId !== currentPlayerIdentifier) {
        playerPenaltyCounts[playerIdx]++;
      }
    }
  }

  const outputGameResults = (scoresArray, thresholdValue) => {
    scoresArray.forEach(individualScore => {
      const hasReachedPenaltyLimit = (individualScore >= thresholdValue);
      if (hasReachedPenaltyLimit) {
        console.log('No');
      } else {
        console.log('Yes');
      }
    });
  };

  outputGameResults(playerPenaltyCounts, requiredScoreThreshold);
}

processGameData(require("fs").readFileSync("/dev/stdin", "utf8"));
