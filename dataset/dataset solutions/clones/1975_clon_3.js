"use strict";

const processInputAndSolve = (inputString) => {
  const trimmedInputContent = inputString.trim();
  const inputDataLines = trimmedInputContent.split("\n");

  const arrayLength = parseInt(inputDataLines[0], 10);
  const numberStrings = inputDataLines[1].split(" ");
  const numericData = numberStrings.map(Number);

  const RECURSION_BASE_VALUE = 0;

  const computeMaxScoreRecursive = (currentIdx, availableIndices) => {
    if (currentIdx < RECURSION_BASE_VALUE) {
      return RECURSION_BASE_VALUE;
    }

    let maximumScoreForCurrentStep = -Infinity;

    for (const selectedTargetIdx of availableIndices) {
      const remainingIndicesForNextStep = availableIndices.filter(
        (idx) => idx !== selectedTargetIdx
      );

      const indexDifference = Math.abs(currentIdx - selectedTargetIdx);

      const currentSegmentContribution = numericData[currentIdx] * indexDifference;

      const subsequentPathScore = computeMaxScoreRecursive(
        currentIdx - 1,
        remainingIndicesForNextStep
      );

      const combinedPathScore = currentSegmentContribution + subsequentPathScore;

      if (combinedPathScore > maximumScoreForCurrentStep) {
        maximumScoreForCurrentStep = combinedPathScore;
      }
    }

    return maximumScoreForCurrentStep;
  };

  const initialIndicesSet = Array.from({ length: arrayLength }, (_, k) => k);

  const finalCalculatedResult = computeMaxScoreRecursive(
    arrayLength - 1,
    initialIndicesSet
  );

  console.log(finalCalculatedResult);
};

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
