function processInputData(rawData) {
  const [firstLineContent] = rawData.split('\n');
  const [paramA, paramB, paramC] = firstLineContent.split(' ').map(Number);

  const dividendValue = paramA - paramC;
  const divisorValue = paramC + paramB;

  let finalResult;

  if (divisorValue === 0) {
    if (dividendValue > 0) {
      finalResult = Infinity;
    } else if (dividendValue < 0) {
      finalResult = -Infinity;
    } else {
      finalResult = NaN; // 0/0
    }
  } else {
    let currentQuotient = 0;
    let currentAccumulator = 0; // Represents currentQuotient * effectiveDivisor

    if (divisorValue > 0) {
      if (dividendValue >= 0) {
        while (currentAccumulator + divisorValue <= dividendValue) {
          currentAccumulator += divisorValue;
          currentQuotient++;
        }
      } else { // dividendValue < 0
        while (currentAccumulator > dividendValue) {
          currentAccumulator -= divisorValue;
          currentQuotient--;
        }
      }
    } else { // divisorValue < 0
      // To handle negative divisors, we can transform the problem:
      // floor(A/B) where B < 0 is equivalent to floor(-A / -B)
      // This allows us to reuse the logic for positive divisors.
      const transformedDividend = -dividendValue;
      const transformedDivisor = -divisorValue;

      if (transformedDividend >= 0) {
        while (currentAccumulator + transformedDivisor <= transformedDividend) {
          currentAccumulator += transformedDivisor;
          currentQuotient++;
        }
      } else { // transformedDividend < 0
        while (currentAccumulator > transformedDividend) {
          currentAccumulator -= transformedDivisor;
          currentQuotient--;
        }
      }
    }
    finalResult = currentQuotient;
  }

  console.log('%s', finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
