var collectedInputData = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(receivedDataChunk) {
  collectedInputData += receivedDataChunk;
});

process.stdin.on('end', function() {
  const POINTS_FOR_WIN = 3;
  const POINTS_FOR_DRAW = 1;

  function calculateRoundPoints(cardAValue, cardBValue) {
    let scoreForPlayerA = 0;
    let scoreForPlayerB = 0;

    if (cardAValue < cardBValue) {
      scoreForPlayerB = POINTS_FOR_WIN;
    } else if (cardAValue === cardBValue) {
      scoreForPlayerA = POINTS_FOR_DRAW;
      scoreForPlayerB = POINTS_FOR_DRAW;
    } else { // cardAValue > cardBValue
      scoreForPlayerA = POINTS_FOR_WIN;
    }
    return { playerA: scoreForPlayerA, playerB: scoreForPlayerB };
  }

  let processedLines = collectedInputData.split("\n");

  // Remove any empty strings that might result from trailing newlines in the input
  processedLines = processedLines.filter(lineContent => lineContent.trim() !== '');

  const totalGameRounds = parseInt(processedLines[0], 10);
  let playerOneTotalScore = 0;
  let playerTwoTotalScore = 0;

  // Iterate through each round's data, starting from the second line
  // The slice method extracts the relevant lines for the rounds
  processedLines.slice(1, totalGameRounds + 1).forEach(function(roundDataLine) {
    const cardStringsForRound = roundDataLine.split(" ");
    const playerOneCard = cardStringsForRound[0];
    const playerTwoCard = cardStringsForRound[1];

    const currentRoundScores = calculateRoundPoints(playerOneCard, playerTwoCard);
    playerOneTotalScore += currentRoundScores.playerA;
    playerTwoTotalScore += currentRoundScores.playerB;
  });

  console.log(playerOneTotalScore, playerTwoTotalScore);
});
