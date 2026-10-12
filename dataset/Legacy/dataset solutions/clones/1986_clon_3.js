const computeGCD = (val1, val2, val3) => {
  let greatestDivisor = 0;
  const MAX_CHECK_LIMIT = 200;

  for (let candidateDivisor = 1; candidateDivisor <= MAX_CHECK_LIMIT; candidateDivisor++) {
    const isDivisorOfVal1 = (val1 % candidateDivisor === 0);
    const isDivisorOfVal2 = (val2 % candidateDivisor === 0);
    const isDivisorOfVal3 = (val3 % candidateDivisor === 0);

    if (isDivisorOfVal1 && isDivisorOfVal2 && isDivisorOfVal3) {
      greatestDivisor = candidateDivisor;
    }
  }
  return greatestDivisor;
};

function processInputData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const upperBoundString = inputLines[0];
  const upperBound = Number(upperBoundString);

  const calculateTotalSum = (limit, gcdCalculator) => {
    let cumulativeSum = 0;

    for (let iterA = 1; iterA <= limit; iterA++) {
      for (let iterB = 1; iterB <= limit; iterB++) {
        for (let iterC = 1; iterC <= limit; iterC++) {
          cumulativeSum += gcdCalculator(iterA, iterB, iterC);
        }
      }
    }
    return cumulativeSum;
  };

  const finalResult = calculateTotalSum(upperBound, computeGCD);

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
