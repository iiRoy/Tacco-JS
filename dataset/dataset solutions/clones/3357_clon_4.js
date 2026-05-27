"use strict";

const processValues = (rawInput) => {
  const [firstVal, secondVal, thirdVal] = rawInput.split(" ").map(Number);

  // Calculate the initial score component based on secondVal and thirdVal.
  // This replaces the first conditional block (if b >= c else) and its mutations.
  const pairedSecondThirdCount = Math.min(secondVal, thirdVal);
  const scoreFromSecondThirdPairs = pairedSecondThirdCount * 2;
  const remainingSecondAfterPairing = Math.max(0, secondVal - thirdVal);
  const remainingThirdAfterSecondPairing = Math.max(0, thirdVal - secondVal);

  const currentAccumulatedScore = scoreFromSecondThirdPairs + remainingSecondAfterPairing;

  // Calculate the next score component by pairing firstVal with the remaining thirdVal.
  // This replaces the second conditional block (if c > 0 and Math.min(c, a)).
  const pairedFirstRemainingThirdCount = Math.min(firstVal, remainingThirdAfterSecondPairing);
  const scoreFromFirstThirdPairs = pairedFirstRemainingThirdCount;
  const finalRemainingThird = remainingThirdAfterSecondPairing - pairedFirstRemainingThirdCount;

  const scoreAfterFirstThirdPairing = currentAccumulatedScore + scoreFromFirstThirdPairs;

  // Apply the final adjustment if any thirdVal remains.
  // This replaces the last conditional block (if c > 0).
  const finalResult = scoreAfterFirstThirdPairing + (finalRemainingThird > 0 ? 1 : 0);

  return finalResult;
};

const entryPoint = (inputData) => {
  console.log(processValues(inputData));
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
