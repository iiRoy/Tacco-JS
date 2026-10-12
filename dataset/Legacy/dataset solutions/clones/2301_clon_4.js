"use strict";
const fileSystem = require("fs");

const opponentToWin = {
  r: "P",
  s: "R",
  p: "S"
};

const inputLines = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");
const paramsLine = inputLines[0].split(" ");
const scoresLine = inputLines[1].split(" ");

const totalRounds = parseInt(paramsLine[0]);
const numStrides = parseInt(paramsLine[1]);

const rockScore = parseInt(scoresLine[0]);
const scissorsScore = parseInt(scoresLine[1]);
const paperScore = parseInt(scoresLine[2]);

const gameSequence = inputLines[2];

const moveScores = { R: rockScore, S: scissorsScore, P: paperScore };

const cumulativeScore = Array.from({ length: numStrides }, (_, k) =>
  calculateSubsequenceScore(k, numStrides, gameSequence, moveScores, opponentToWin)
).reduce((sum, current) => sum + current, 0);

console.log(cumulativeScore);

function calculateSubsequenceScore(startIdx, stepSize, fullSequence, scoresMap, winMap) {
  const sequenceOfWinningMoves = Array.from(
    { length: Math.ceil((fullSequence.length - startIdx) / stepSize) },
    (_, i) => winMap[fullSequence[startIdx + i * stepSize]]
  );

  const [finalSubScore, lastMove, currentStreak] = sequenceOfWinningMoves.reduce(
    (accumulator, currentMove) => {
      let [currentTotal, prevMove, streakCount] = accumulator;

      if (prevMove === null || currentMove !== prevMove) {
        if (prevMove !== null) {
          currentTotal += scoresMap[prevMove] * Math.floor((streakCount + 1) / 2);
        }
        return [currentTotal, currentMove, 1];
      } else {
        return [currentTotal, prevMove, streakCount + 1];
      }
    },
    [0, null, 0]
  );

  if (lastMove !== null) {
    return finalSubScore + scoresMap[lastMove] * Math.floor((currentStreak + 1) / 2);
  }
  return finalSubScore;
}
