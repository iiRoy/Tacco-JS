const generateMapKey = (rowIdx, colIdx) => `row_${rowIdx}_col_${colIdx}`;

const memoizationCache = new Map();

const MODULO_PRIME = 998244353n;

const computeValue = (initialA, initialB, currentC, currentD) => {
  const currentKey = generateMapKey(currentC, currentD);

  if (memoizationCache.has(currentKey)) {
    return memoizationCache.get(currentKey);
  }

  let calculatedResult;

  if (initialA === currentC) {
    const exponentVal = currentD - initialB;
    calculatedResult = (initialA ** exponentVal) % MODULO_PRIME;
  } else if (initialB === currentD) {
    const exponentVal = currentC - initialA;
    calculatedResult = (initialB ** exponentVal) % MODULO_PRIME;
  } else {
    const recursiveTerm1 = computeValue(initialA, initialB, currentC - 1n, currentD);
    const recursiveTerm2 = computeValue(initialA, initialB, currentC, currentD - 1n);
    const recursiveTerm3 = computeValue(initialA, initialB, currentC - 1n, currentD - 1n);

    const productComponent1 = recursiveTerm1 * currentD;
    const productComponent2 = recursiveTerm2 * currentC;
    const productComponent3Factor = (currentC - 1n) * (currentD - 1n);
    const productComponent3 = recursiveTerm3 * productComponent3Factor;

    calculatedResult = (productComponent1 + productComponent2 - productComponent3) % MODULO_PRIME;
  }

  memoizationCache.set(currentKey, calculatedResult);
  return calculatedResult;
};

const parseBigIntsFromString = (inputLine) => {
  return inputLine.split(" ").map(numericString => BigInt(numericString));
};

const processInput = (rawData) => {
  const inputLines = rawData.split("\n");
  const [valA, valB, valC, valD] = parseBigIntsFromString(inputLines[0]);

  const finalComputedValue = computeValue(valA, valB, valC, valD);
  console.log(Number(finalComputedValue));
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
