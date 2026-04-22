'use strict';

const getMatchPoints = (playerOneScoreString, playerTwoScoreString) => {
  const scoreAlpha = parseInt(playerOneScoreString, 10);
  const scoreBeta = parseInt(playerTwoScoreString, 10);

  if (scoreAlpha > scoreBeta) {
    return [3, 0]; // First player wins
  } else if (scoreAlpha < scoreBeta) {
    return [0, 3]; // Second player wins
  } else {
    return [1, 1]; // Draw
  }
};

const calculateTotalScoresRecursively = (remainingMatches, currentTotalA = 0, currentTotalB = 0) => {
  if (remainingMatches.length === 0) {
    return [currentTotalA, currentTotalB];
  }

  const firstMatchEntry = remainingMatches[0];
  const otherMatches = remainingMatches.slice(1);

  const [scorePartOne, scorePartTwo] = firstMatchEntry.split(' ');
  const [pointsForA, pointsForB] = getMatchPoints(scorePartOne, scorePartTwo);

  return calculateTotalScoresRecursively(otherMatches, currentTotalA + pointsForA, currentTotalB + pointsForB);
};

const processGameData = (fullInputText) => {
  const allInputLines = fullInputText.split('\n');
  const numberOfGames = parseInt(allInputLines[0], 10);

  const gameEntries = allInputLines.slice(1, numberOfGames + 1);

  const finalGameScores = calculateTotalScoresRecursively(gameEntries);
  return `${finalGameScores[0]} ${finalGameScores[1]}`;
};

((rawInputContent) => {
  const finalResultString = processGameData(rawInputContent);
  console.log(finalResultString);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));