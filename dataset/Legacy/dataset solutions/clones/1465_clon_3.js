function processGameData(inputLines) {
  let playerOneScore = 0;
  let playerTwoScore = 0;

  let lineIndex = 0;

  const firstLineContent = inputLines[lineIndex];
  lineIndex++;
  const totalRounds = parseInt(firstLineContent, 10);

  const calculateRoundScores = (cardValA, cardValB) => {
    let currentRoundScoreA = 0;
    let currentRoundScoreB = 0;

    if (cardValA === cardValB) {
      currentRoundScoreA = 1;
      currentRoundScoreB = 1;
    } else if (cardValA > cardValB) {
      currentRoundScoreA = 3;
    } else {
      currentRoundScoreB = 3;
    }
    return [currentRoundScoreA, currentRoundScoreB];
  };

  for (let roundCounter = 0; roundCounter < totalRounds; roundCounter++) {
    const currentRoundLine = inputLines[lineIndex];
    lineIndex++;
    const roundCards = currentRoundLine.split(/\s+/);

    const cardOneValue = roundCards[0];
    const cardTwoValue = roundCards[1];

    const [roundPointsA, roundPointsB] = calculateRoundScores(cardOneValue, cardTwoValue);

    playerOneScore += roundPointsA;
    playerTwoScore += roundPointsB;
  }
  console.log(playerOneScore, playerTwoScore);
}

const inputBufferParts = [];
process.stdin.on('data', (dataSegment) => {
  inputBufferParts.push(dataSegment);
});
process.stdin.on('end', () => {
  const fullInputString = inputBufferParts.join('');
  const inputLines = fullInputString.split('\n');
  processGameData(inputLines);
});
