function* tokenIterator(rawInput) {
  const lineSegments = rawInput.split("\n");
  let currentLineIndex = 0;
  let currentTokenIndex = 0;

  while (currentLineIndex < lineSegments.length) {
    const activeLine = lineSegments[currentLineIndex].trim();
    if (activeLine === "") {
      currentLineIndex++;
      currentTokenIndex = 0;
      continue;
    }
    const lineTokens = activeLine.split(" ");

    while (currentTokenIndex < lineTokens.length) {
      const tokenValue = lineTokens[currentTokenIndex];
      if (tokenValue !== "") {
        yield Number(tokenValue);
      }
      currentTokenIndex++;
    }
    currentLineIndex++;
    currentTokenIndex = 0;
  }
}

function processInput(inputData) {
  const inputReader = tokenIterator(inputData);

  const totalElements = inputReader.next().value;
  const targetValue = inputReader.next().value;

  const sourceNumbers = Array.from({ length: totalElements }, () => inputReader.next().value);

  sourceNumbers.sort((a, b) => a - b);

  const MODULO_CONST = 1000000007;

  const factorialValues = Array.from({ length: totalElements + 1 }, (_, idx) => {
    if (idx <= 1) return 1;
    return (factorialValues[idx - 1] * idx) % MODULO_CONST;
  });

  if (sourceNumbers[0] === 1) {
    console.log(0);
  } else {
    const memoizationCache = new Map();

    const computeResult = (currentVal, remainingCount) => {
      const cacheKey = `${currentVal},${remainingCount}`;
      if (memoizationCache.has(cacheKey)) {
        return memoizationCache.get(cacheKey);
      }

      if (currentVal < sourceNumbers[0]) {
        const baseResult = (currentVal * factorialValues[remainingCount]) % MODULO_CONST;
        memoizationCache.set(cacheKey, baseResult);
        return baseResult;
      }

      const accumulatedSum = sourceNumbers
        .filter(num => num < currentVal)
        .reduce((acc, divisor) => {
          return (acc + computeResult(currentVal % divisor, remainingCount - 1)) % MODULO_CONST;
        }, 0);

      memoizationCache.set(cacheKey, accumulatedSum);
      return accumulatedSum;
    };

    console.log(computeResult(targetValue, totalElements));
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
