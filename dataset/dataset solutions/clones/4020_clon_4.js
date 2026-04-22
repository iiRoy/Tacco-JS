const retrieveDigitSum = (numericValue) => {
  let accumulatedSum = 0;
  let workingValue = numericValue;
  while (workingValue > 0) {
    accumulatedSum += workingValue % 10;
    workingValue = Math.floor(workingValue / 10);
  }
  return accumulatedSum;
};

const determineHighestDigitSum = (inputDataString) => {
  const upperLimit = parseInt(inputDataString, 10);
  if (isNaN(upperLimit) || upperLimit <= 0) {
    return 0;
  }

  const generatedSequence = Array.from({ length: upperLimit }, (_, idx) => idx);
  const sumsOfDigits = generatedSequence.map(retrieveDigitSum);

  return Math.max(...sumsOfDigits);
};

console.log(determineHighestDigitSum(require("fs").readFileSync("/dev/stdin", "utf8")));