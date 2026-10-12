function checkDivisibility(numValue) {
  const firstDivisor = 3;
  const secondDivisor = 5;

  const isMultipleOfFirst = (numValue % firstDivisor === 0);
  const isMultipleOfSecond = (numValue % secondDivisor === 0);

  return !(isMultipleOfFirst || isMultipleOfSecond);
}

function calculateAndLogSum(inputStringData) {
  const limitNumber = Number(inputStringData);
  let accumulatedSum = 0;

  const iterationCeiling = limitNumber + 1;

  let currentIterationValue = 1;
  while (currentIterationValue < iterationCeiling) {
    const meetsCriteria = checkDivisibility(currentIterationValue);

    if (meetsCriteria) {
      accumulatedSum += currentIterationValue;
    }
    currentIterationValue++;
  }

  console.log(accumulatedSum);
}

calculateAndLogSum(require("fs").readFileSync("/dev/stdin", "utf8"));
