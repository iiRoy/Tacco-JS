"use strict";
const fileSystem = require("fs");

const handOutcomes = {
  r: "P",
  s: "R",
  p: "S"
};

const inputLines = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");

const initialParams = inputLines[0].split(" ");
const totalRounds = parseInt(initialParams[0], 10);
const numStrides = parseInt(initialParams[1], 10);

const scoreValues = inputLines[1].split(" ");
const rockScore = parseInt(scoreValues[0], 10);
const scissorsScore = parseInt(scoreValues[1], 10);
const paperScore = parseInt(scoreValues[2], 10);

const scoreMap = {
  R: rockScore,
  S: scissorsScore,
  P: paperScore
};

const gameSequence = inputLines[2];

let finalScore = 0;

for (let strideIndex = 0; strideIndex < numStrides; ++strideIndex) {
  finalScore += calculateSubsequenceScore(strideIndex, numStrides);
}

console.log(finalScore);

function calculateSubsequenceScore(startIndex, stepSize) {
  let currentSubsequenceScore = 0;
  let lastWinningMove = null;
  let consecutiveCount = 0;

  const addBlockScore = (moveType, count) => {
    if (moveType && count > 0) {
      const pointsPerWin = scoreMap[moveType];
      const effectiveWinsInBlock = Math.floor((count + 1) / 2);
      return pointsPerWin * effectiveWinsInBlock;
    }
    return 0;
  };

  for (let sequenceIndex = startIndex; sequenceIndex < gameSequence.length; sequenceIndex += stepSize) {
    const opponentHandChar = gameSequence[sequenceIndex];
    const currentWinningMove = handOutcomes[opponentHandChar];

    if (currentWinningMove !== lastWinningMove) {
      currentSubsequenceScore += addBlockScore(lastWinningMove, consecutiveCount);
      consecutiveCount = 0;
    }
    lastWinningMove = currentWinningMove;
    consecutiveCount++;
  }

  currentSubsequenceScore += addBlockScore(lastWinningMove, consecutiveCount);

  return currentSubsequenceScore;
}
