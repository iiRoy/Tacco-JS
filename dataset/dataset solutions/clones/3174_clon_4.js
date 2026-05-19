"use strict";

function mainExecution() {
  const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
  const inputLines = rawInput.split("\n");

  const [numPieces, targetA, targetB, targetC] = inputLines[0].split(/\s+/).map(Number);

  const bambooLengths = inputLines.slice(1, 1 + numPieces).map(Number);

  let minimumCost = Infinity;

  function exploreCombinations(pieceIdx, currentLenA, currentCountA, currentLenB, currentCountB, currentLenC, currentCountC) {
    if (pieceIdx === numPieces) {
      if (currentCountA > 0 && currentCountB > 0 && currentCountC > 0) {
        let combinationTotalCost = 0;

        combinationTotalCost += (currentCountA - 1) * 10 + Math.abs(currentLenA - targetA);
        combinationTotalCost += (currentCountB - 1) * 10 + Math.abs(currentLenB - targetB);
        combinationTotalCost += (currentCountC - 1) * 10 + Math.abs(currentLenC - targetC);

        minimumCost = Math.min(minimumCost, combinationTotalCost);
      }
      return;
    }

    const currentPieceLength = bambooLengths[pieceIdx];

    exploreCombinations(pieceIdx + 1, currentLenA + currentPieceLength, currentCountA + 1, currentLenB, currentCountB, currentLenC, currentCountC);

    exploreCombinations(pieceIdx + 1, currentLenA, currentCountA, currentLenB + currentPieceLength, currentCountB + 1, currentLenC, currentCountC);

    exploreCombinations(pieceIdx + 1, currentLenA, currentCountA, currentLenB, currentCountB, currentLenC + currentPieceLength, currentCountC + 1);

    exploreCombinations(pieceIdx + 1, currentLenA, currentCountA, currentLenB, currentCountB, currentLenC, currentCountC);
  }

  exploreCombinations(0, 0, 0, 0, 0, 0, 0);

  console.log(minimumCost);
}

mainExecution();
