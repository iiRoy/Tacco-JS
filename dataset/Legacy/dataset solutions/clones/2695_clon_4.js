"use strict";

const parseNumericalInput = (sourceText) => {
  const segments = sourceText.split(" ");
  const firstValue = Number.parseInt(segments[0], 10);
  const secondValue = Number.parseInt(segments[1], 10);
  return { firstValue, secondValue };
};

const determineMidpointWithinRange = (operandA, operandB) => {
  const totalSum = operandA + operandB;

  if (totalSum % 2 !== 0) {
    return "IMPOSSIBLE";
  }

  const potentialSolution = totalSum / 2;
  const absoluteDifference = Math.abs(operandA - operandB);

  if (potentialSolution >= 0 && potentialSolution < absoluteDifference) {
    return potentialSolution;
  } else {
    return "IMPOSSIBLE";
  }
};

const executeProgram = (dataPayload) => {
  const { firstValue, secondValue } = parseNumericalInput(dataPayload);
  const finalOutcome = determineMidpointWithinRange(firstValue, secondValue);
  console.log(finalOutcome);
};

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
