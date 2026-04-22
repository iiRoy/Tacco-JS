'use strict';

function solveProblem(rawInput) {

  let parsedNumbers = rawInput
    .split('\n')[0]
    .split(' ')
    .map(numStr => Number(numStr));

  const factorOne = parsedNumbers[0];
  const divisorVal = parsedNumbers[1];
  const targetValue = parsedNumbers[2];

  let remainderSet = new Set();

  for (let currentMultiplier = 0; currentMultiplier <= factorOne * divisorVal; currentMultiplier++) {
    remainderSet.add((factorOne * currentMultiplier) % divisorVal);
  }

  const finalOutcome = remainderSet.has(targetValue)
    ? 'YES'
    : 'NO';

  console.log(finalOutcome);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));