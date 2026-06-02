"use strict"

const parseNumericValue = (textValue) => {
  return parseInt(textValue, 10);
};

const processInput = (rawData) => {
  const inputSegments = rawData.split(" ");
  const firstValueString = inputSegments[0];
  const secondValueString = inputSegments[1];

  const valA = parseNumericValue(firstValueString);
  const valB = parseNumericValue(secondValueString);

  const absDiff = Math.abs(valA - valB);

  let resultValue = "IMPOSSIBLE";
  let solutionFound = false;

  const totalSum = valA + valB;
  const isSumEven = (totalSum % 2 === 0);

  if (isSumEven) {
    const candidateMidpoint = totalSum / 2;

    const isCandidateNonNegative = (candidateMidpoint >= 0);
    const isCandidateLessThanAbsDiff = (candidateMidpoint < absDiff);

    if (isCandidateNonNegative && isCandidateLessThanAbsDiff) {
      resultValue = candidateMidpoint;
      solutionFound = true;
    }
  }

  console.log(resultValue);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
