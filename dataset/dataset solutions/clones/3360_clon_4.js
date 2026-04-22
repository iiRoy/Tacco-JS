"use strict";

const parseParameters = (inputString) => {
  const [upperBound, primaryInput, secondaryInput] = inputString.split(" ").map(Number);
  return {
    limit: upperBound,
    firstQuantity: primaryInput,
    secondQuantity: secondaryInput,
    currentSum: 0
  };
};

const evaluateFirstPhase = (systemState) => {
  const { limit, firstQuantity, secondQuantity, currentSum } = systemState;
  const pairedPortion = Math.min(firstQuantity, secondQuantity);
  const phaseOneSum = currentSum + (pairedPortion * 2) + (firstQuantity - pairedPortion);
  const remainingSecond = secondQuantity - pairedPortion;
  return {
    limit: limit,
    secondRemaining: remainingSecond,
    intermediateSum: phaseOneSum
  };
};

const evaluateSecondPhase = (systemState) => {
  const { limit, secondRemaining, intermediateSum } = systemState;
  const usedByLimit = Math.min(secondRemaining, limit);
  const phaseTwoSum = intermediateSum + usedByLimit;
  const finalSecondRemaining = secondRemaining - usedByLimit;
  return {
    secondFinal: finalSecondRemaining,
    finalAccumulation: phaseTwoSum
  };
};

const evaluateThirdPhase = (systemState) => {
  const { secondFinal, finalAccumulation } = systemState;
  const phaseThreeSum = finalAccumulation + (secondFinal > 0 ? 1 : 0);
  return phaseThreeSum;
};

const processDataStream = (dataSource) => {
  const initialConfiguration = parseParameters(dataSource);
  const resultAfterPhaseOne = evaluateFirstPhase(initialConfiguration);
  const resultAfterPhaseTwo = evaluateSecondPhase(resultAfterPhaseOne);
  const ultimateOutcome = evaluateThirdPhase(resultAfterPhaseTwo);
  console.log(ultimateOutcome);
};

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));