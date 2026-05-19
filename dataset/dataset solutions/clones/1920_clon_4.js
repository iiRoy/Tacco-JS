'use strict';
function processInput(rawContent) {
  const dataLines = rawContent.trim().split('\n');
  const desiredAmount = Number(dataLines[0]);

  const initialCapital = 100;
  const growthRate = 1.01;

  if (desiredAmount <= initialCapital) {
    console.log(0);
    return;
  }

  const ratioTarget = desiredAmount / initialCapital;
  const logRatioTarget = Math.log(ratioTarget);
  const logGrowthFactor = Math.log(growthRate);

  const calculatedIterations = logRatioTarget / logGrowthFactor;
  const finalIterationCount = Math.ceil(calculatedIterations);

  console.log(finalIterationCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
