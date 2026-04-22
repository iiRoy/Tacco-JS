"use strict";
const processNumericalSequence = (inputBlob) => {
  const numericalTokens = inputBlob.match(/\d+/g);
  const numericValues = numericalTokens.map(val => parseInt(val, 10));

  const initialPositiveSupply = numericValues[0];
  const initialNeutralSupply = numericValues[1];
  const initialNegativeSupply = numericValues[2];
  let totalOperationsDesired = numericValues[3];

  let accumulatedScore = 0;

  const positiveContributionsTaken = Math.min(initialPositiveSupply, totalOperationsDesired);
  accumulatedScore += positiveContributionsTaken;
  totalOperationsDesired -= positiveContributionsTaken;

  const neutralContributionsTaken = Math.min(initialNeutralSupply, totalOperationsDesired);
  totalOperationsDesired -= neutralContributionsTaken;

  const negativeContributionsTaken = Math.min(initialNegativeSupply, totalOperationsDesired);
  accumulatedScore -= negativeContributionsTaken;

  return accumulatedScore;
};

const executeComputation = (inputData) => {
  const cleanInput = inputData.trim().split("\n")[0];
  const finalResult = processNumericalSequence(cleanInput);
  console.log(finalResult);
};

executeComputation(require('node:fs').readFileSync(0, 'utf8'));