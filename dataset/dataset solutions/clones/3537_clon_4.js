"use strict";

function processCandyDistribution(rawInputData) {
  const inputSegments = rawInputData.split("\n");

  const [totalChildrenCount, initialCandyAmount] = inputSegments[0].split(" ").map(Number);

  const childCandyRequirements = inputSegments[1].split(" ").map(Number).sort((valA, valB) => valA - valB);

  const distributionOutcome = childCandyRequirements.reduce(
    (currentStatus, requiredByChild) => {
      if (currentStatus.availableCandy < requiredByChild) {
        return currentStatus;
      }

      return {
        availableCandy: currentStatus.availableCandy - requiredByChild,
        childrenSatisfied: currentStatus.childrenSatisfied + 1,
      };
    },
    { availableCandy: initialCandyAmount, childrenSatisfied: 0 }
  );

  let finalSatisfiedCount = distributionOutcome.childrenSatisfied;
  const remainingCandyAmount = distributionOutcome.availableCandy;

  if (remainingCandyAmount !== 0 && finalSatisfiedCount !== 0) {
    finalSatisfiedCount--;
  }

  return finalSatisfiedCount;
}

function Main(input) {
  const resultValue = processCandyDistribution(input);
  console.log(resultValue);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
