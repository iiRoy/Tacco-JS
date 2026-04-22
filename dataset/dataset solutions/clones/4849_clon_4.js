const dataManipulator = require("fs");

const extractNumerics = (sourceLocation) => {
  const rawStream = dataManipulator.readFileSync(sourceLocation, "utf8");
  const initialSegment = rawStream.trim().split("\n")[0];
  return initialSegment.split(" ").map(val => Number(val));
};

const calculateCombinedInverse = (firstOperand, secondOperand) => {
  if (firstOperand + secondOperand === 0) {
    return 0;
  }
  return (firstOperand * secondOperand) / (firstOperand + secondOperand);
};

const presentFinalResult = (computedValue) => {
  console.log(computedValue);
};

(() => {
  const numericalElements = extractNumerics("/dev/stdin");
  const termA = numericalElements[0];
  const termB = numericalElements[1];

  const finalCalculation = calculateCombinedInverse(termA, termB);
  presentFinalResult(finalCalculation);
})();