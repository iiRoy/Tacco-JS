const calculateMinFactorDigits = (sourceData) => {
  const targetNumber = parseInt(sourceData);

  const obtainDigitCount = (value) => String(value).length;

  const upperBoundary = Math.floor(Math.sqrt(targetNumber));

  let optimalDigitCount = obtainDigitCount(targetNumber);

  const candidateFactors = Array.from({ length: upperBoundary }, (_, index) => index + 1);

  optimalDigitCount = candidateFactors.reduce((accumulator, currentDivisor) => {
    const isFactor = targetNumber % currentDivisor === 0;

    return isFactor
      ? Math.min(
          accumulator,
          Math.max(
            obtainDigitCount(currentDivisor),
            obtainDigitCount(targetNumber / currentDivisor)
          )
        )
      : accumulator;
  }, optimalDigitCount);

  console.log('%s', optimalDigitCount);
};

calculateMinFactorDigits(require("fs").readFileSync("/dev/stdin", "utf8"));
