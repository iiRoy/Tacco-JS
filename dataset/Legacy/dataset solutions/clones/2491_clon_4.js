"use strict";

main(require("fs").readFileSync("/dev/stdin", "UTF-8"));

function main(inputData) {
  const lines = inputData.split("\n");

  const itemCount = Number(lines[0]);
  
  const flavorScores = lines[1].split(" ").map(scoreStr => Number(scoreStr));

  let sumOfAllScores = 0;
  let sumOfSquaredAllScores = 0;

  sumOfAllScores = flavorScores.reduce((accumulator, currentScore) => accumulator + currentScore, 0);
  sumOfSquaredAllScores = flavorScores.reduce((accumulator, currentScore) => accumulator + (currentScore * currentScore), 0);

  const finalProductSum = (sumOfAllScores * sumOfAllScores - sumOfSquaredAllScores) / 2;

  console.log(finalProductSum);
}
