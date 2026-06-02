"use strict";

function parseInputData(rawInputStr) {
  const inputLines = rawInputStr.split("\n");
  const totalTakoyakiCount = parseInt(inputLines[0], 10);
  const takoyakiScores = inputLines[1].split(" ").map(scoreText => parseInt(scoreText, 10));
  return { totalTakoyakiCount, takoyakiScores };
}

function calculateTakoyakiScore(rawInputString) {
  const { totalTakoyakiCount, takoyakiScores } = parseInputData(rawInputString);

  let sumOfAllScores = 0;
  let sumOfSquaredScores = 0;

  for (const currentScore of takoyakiScores) {
    sumOfAllScores += currentScore;
    sumOfSquaredScores += currentScore * currentScore;
  }

  // The original code calculates sum(takoyakiScores[i] * takoyakiScores[f]) for i < f.
  // This can be mathematically transformed using the identity:
  // (sum(a_i))^2 = sum(a_i^2) + 2 * sum(a_i * a_j for i < j)
  // Therefore, sum(a_i * a_j for i < j) = ((sum(a_i))^2 - sum(a_i^2)) / 2
  const cumulativeDeliciousness = (sumOfAllScores * sumOfAllScores - sumOfSquaredScores) / 2;

  console.log(cumulativeDeliciousness);
}

calculateTakoyakiScore(require("fs").readFileSync("/dev/stdin", "UTF-8"));
