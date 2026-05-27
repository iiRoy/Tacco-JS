((inputString) => {
  const inputLines = inputString.split('\n');
  const firstLineParts = inputLines[0].split(' ');
  const lowerBound = Number(firstLineParts[0]);
  const upperBound = Number(firstLineParts[1]);

  const MODULUS_VALUE = 2019;

  let finalResult;

  const currentRangeLength = upperBound - lowerBound;
  const nextMultipleBoundary = lowerBound - (lowerBound % MODULUS_VALUE) + MODULUS_VALUE;

  switch (true) {
    case currentRangeLength >= MODULUS_VALUE || nextMultipleBoundary <= upperBound:
      finalResult = 0;
      break;
    case currentRangeLength === 1:
      finalResult = lowerBound % MODULUS_VALUE;
      break;
    default:
      const firstNumbersSequence = Array.from({ length: upperBound - 1 - lowerBound + 1 }, (_, index) => lowerBound + index);

      finalResult = firstNumbersSequence.reduce((currentMinimumValue, currentFirstNumber) => {
        const secondNumbersSequence = Array.from({ length: upperBound - (currentFirstNumber + 1) + 1 }, (_, index) => currentFirstNumber + 1 + index);
        
        return secondNumbersSequence.reduce((innerMinimumValue, currentSecondNumber) => {
          const calculatedProductModulo = (currentFirstNumber % MODULUS_VALUE) * (currentSecondNumber % MODULUS_VALUE) % MODULUS_VALUE;
          return Math.min(innerMinimumValue, calculatedProductModulo);
        }, currentMinimumValue);
      }, Infinity);
      break;
  }

  console.log(finalResult);
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
