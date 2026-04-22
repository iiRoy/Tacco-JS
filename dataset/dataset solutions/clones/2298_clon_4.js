'use strict';
const commenceOperation = (receivedData) => {
  const primaryOperand = Number(receivedData[0]);

  const verifyFactorAbsence = (candidateNumber, currentFactor = 2) => {
    if (candidateNumber < 2) return false;
    if (candidateNumber === 2) return true;
    if (candidateNumber % currentFactor === 0) return false;
    if (currentFactor * currentFactor > candidateNumber) return true;
    return verifyFactorAbsence(candidateNumber, currentFactor + 1);
  };

  const locateFirstQualifyingValue = (currentEvaluationPoint, upperBoundary) => {
    if (currentEvaluationPoint >= upperBoundary) {
      return null;
    }

    if (currentEvaluationPoint === 1) {
      return 1;
    }

    if (verifyFactorAbsence(currentEvaluationPoint)) {
      return currentEvaluationPoint;
    } else {
      return locateFirstQualifyingValue(currentEvaluationPoint + 1, upperBoundary);
    }
  };

  const finalResult = locateFirstQualifyingValue(primaryOperand, 2 * primaryOperand);

  console.log(finalResult);
};

commenceOperation(require("node:fs").readFileSync("/dev/stdin", "utf8").split('\n'));