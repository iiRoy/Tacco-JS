var fileSystemModule = require('fs');
var inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(inputDataLength);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);
var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

var currentLineParts, numPlayers, targetPlayerIndex, percentageLost, playerScores;

function parseControlLine(lineContent) {
    const lineSegments = lineContent.split(' ');
    const playerCountValue = Number(lineSegments[0]);
    const targetIndexValue = Number(lineSegments[1]) - 1;
    const percentageLostValue = Number(lineSegments[2]);
    return { playerCount: playerCountValue, targetIdx: targetIndexValue, pctLost: percentageLostValue };
}

function calculatePlayerScore(scoreList, targetPlayerIdx, deductionPct) {
  const targetPlayerScore = scoreList[targetPlayerIdx];

  if (targetPlayerScore === 0) {
    return 0;
  }

  const effectivePercentageMultiplier = 100 - deductionPct;

  var totalScore = scoreList.reduce(function (accumulator, currentValue) {
    return accumulator + currentValue;
  });

  totalScore *= effectivePercentageMultiplier;

  return Math.floor(totalScore / targetPlayerScore);
}

while (inputLines[0] !== '0 0 0') {
  const controlData = parseControlLine(inputLines.shift());

  numPlayers = controlData.playerCount;
  targetPlayerIndex = controlData.targetIdx;
  percentageLost = controlData.pctLost;

  playerScores = [];
  for (var playerCounter = 0; playerCounter < numPlayers; playerCounter++) {
    playerScores[playerCounter] = Number(inputLines.shift());
  }

  console.log(calculatePlayerScore(playerScores, targetPlayerIndex, percentageLost));
}
