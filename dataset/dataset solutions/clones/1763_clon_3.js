function createMemoKey(rowIdentifier, colIdentifier) {
  return "r" + rowIdentifier + "c" + colIdentifier;
}

const memoizationCache = new Map();

const calculateRecursive = (valA, valB, valC, valD) => {
  const currentCacheIdentifier = createMemoKey(valC, valD);

  if (memoizationCache.has(currentCacheIdentifier)) {
    return memoizationCache.get(currentCacheIdentifier);
  }

  let computedResult;
  if (valA === valC) {
    const exponentVal = valD - valB;
    computedResult = valA ** exponentVal;
  } else if (valB === valD) {
    const exponentVal = valC - valA;
    computedResult = valB ** exponentVal;
  } else {
    const termOneResult = calculateRecursive(valA, valB, valC - 1n, valD);
    const termTwoResult = calculateRecursive(valA, valB, valC, valD - 1n);
    const termThreeResult = calculateRecursive(valA, valB, valC - 1n, valD - 1n);

    const multiplierForTermThree = (valC - 1n) * (valD - 1n);

    computedResult = (termOneResult * valD) + (termTwoResult * valC) - (termThreeResult * multiplierForTermThree);
  }

  memoizationCache.set(currentCacheIdentifier, computedResult);
  return computedResult;
};

const processInputAndCompute = (rawData) => {
  const inputLines = rawData.split("\n");
  const firstLineData = inputLines[0];
  const stringNumbers = firstLineData.split(" ");

  const bigIntNumbers = stringNumbers.map(numericString => BigInt(numericString));
  const [paramA, paramB, paramC, paramD] = bigIntNumbers;

  const MODULO_CONSTANT = 998244353n;

  const finalCalculationResult = calculateRecursive(paramA, paramB, paramC, paramD);
  const resultModulo = finalCalculationResult % MODULO_CONSTANT;

  console.log(Number(resultModulo));
};

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
