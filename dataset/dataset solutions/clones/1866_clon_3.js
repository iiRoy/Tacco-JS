const solveProblem = (inputData) => {
  const parseNumericInput = (rawString) => {
    return rawString.trim().split(' ').map(strValue => parseInt(strValue, 10));
  };

  const numericValues = parseNumericInput(inputData);

  const firstCount = numericValues[0];
  const secondCount = numericValues[1];
  const thirdCount = numericValues[2];
  const targetValue = numericValues[3];

  const calculateFinalAdjustment = (initialA, totalK, availableB) => {
    const kConsumedByA = initialA;
    const remainingKAfterA = totalK - kConsumedByA;

    const kConsumedByB = Math.min(availableB, remainingKAfterA);
    const remainingKAfterAandB = remainingKAfterA - kConsumedByB;

    // The "cost" of exceeding A and B is applied as a reduction from A.
    // This is equivalent to A - (K - A - B)
    return initialA - remainingKAfterAandB;
  };

  let finalOutputValue;

  if (firstCount >= targetValue) {
    finalOutputValue = targetValue;
  } else {
    const neededBeyondA = targetValue - firstCount;

    if (secondCount >= neededBeyondA) {
      finalOutputValue = firstCount;
    } else {
      finalOutputValue = calculateFinalAdjustment(firstCount, targetValue, secondCount);
    }
  }

  console.log(finalOutputValue);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

solveProblem(fileSystemModule.readFileSync(standardInputPath, encodingType));
