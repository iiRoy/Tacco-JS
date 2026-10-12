process.stdin.setEncoding('utf-8');

const checkNonDivisibility = (numberToCheck, divisorOne, divisorTwo) => {
  const isMultipleOfFirst = (numberToCheck % divisorOne === 0);
  const isMultipleOfSecond = (numberToCheck % divisorTwo === 0);
  return !(isMultipleOfFirst || isMultipleOfSecond);
};

process.stdin.on('data', function (inputDataString) {
  let calculatedTotal = 0;

  const PRIMARY_DIVISOR = 3;
  const SECONDARY_DIVISOR = 5;

  const parsedUpperLimit = Number(inputDataString);

  for (let iterationValue = 1; iterationValue <= parsedUpperLimit; iterationValue++) {
    if (checkNonDivisibility(iterationValue, PRIMARY_DIVISOR, SECONDARY_DIVISOR)) {
      calculatedTotal += iterationValue;
    }
  }
  console.log(calculatedTotal);
});
