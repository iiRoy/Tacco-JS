"use strict";

const processInputValues = (inputLine) => {
  const [firstVal, secondVal, thirdVal] = inputLine.split(" ").map(Number);

  // Calculate the initial score and remaining third value based on the interaction of second and third values.
  // This replaces the first if/else block by using a ternary operator and array destructuring.
  const [initialScoreComponent, thirdValAfterSecondInteraction] = secondVal >= thirdVal
    ? [secondVal + thirdVal, 0]
    : [secondVal * 2, thirdVal - secondVal];

  // Calculate the score component from the first value interacting with the remaining third value.
  // This replaces the second if block.
  const amountConsumedByFirst = Math.min(thirdValAfterSecondInteraction, firstVal);
  const scoreFromFirstInteraction = amountConsumedByFirst;
  const thirdValAfterFirstInteraction = thirdValAfterSecondInteraction - amountConsumedByFirst;

  // Determine the final bonus point if any third value still remains.
  // This replaces the third if block with a conditional expression.
  const finalRemainingBonus = thirdValAfterFirstInteraction > 0 ? 1 : 0;

  // Sum all calculated score components for the total result.
  const overallResult = initialScoreComponent + scoreFromFirstInteraction + finalRemainingBonus;

  return overallResult;
};

const executeProgram = (inputData) => {
  console.log(processInputValues(inputData));
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
