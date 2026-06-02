const parseInputLine = (line) => line.split(" ").map(Number);

function processInput(inputStr) {
  const numericParams = parseInputLine(inputStr);
  const paramN = numericParams[0];
  const paramA = numericParams[1];
  const paramB = numericParams[2];
  const targetK = numericParams[3];

  let finalResult = 0;

  const calculateContribution = (currentI, currentX) => {
    if (currentX < 0) {
      return 0;
    }
    if (currentX % paramB !== 0) {
      return 0;
    }

    const quotientXB = currentX / paramB;
    if (quotientXB > paramN) {
      return 0;
    }

    const term1 = combinationsModulo(paramN, currentI);
    const term2 = combinationsModulo(paramN, quotientXB);
    return multiplyAndModulo(term1, term2);
  };

  for (let idxI = 0; idxI <= paramN; idxI++) {
    const currentX = targetK - idxI * paramA;
    if (currentX < 0) {
      break;
    }

    const contribution = calculateContribution(idxI, currentX);
    finalResult = (finalResult + contribution) % MODULUS_VALUE;
  }

  console.log(finalResult);
}

function multiplyAndModulo(...factors) {
  let intermediateProduct = factors[0];
  for (let argIdx = 1; argIdx < factors.length; argIdx++) {
    intermediateProduct = (intermediateProduct >>> 16) * factors[argIdx] % MODULUS_VALUE * 0x10000 + (intermediateProduct & 0xFFFF) * factors[argIdx];
    intermediateProduct %= MODULUS_VALUE;
  }
  return intermediateProduct;
}

function powerModulo(baseVal, exponentVal) {
  let currentPowerResult = 1;
  let currentBase = baseVal;
  let currentExponent = exponentVal;

  while (currentExponent > 0) {
    if (currentExponent & 1) {
      currentPowerResult = multiplyAndModulo(currentPowerResult, currentBase);
    }
    currentBase = multiplyAndModulo(currentBase, currentBase);
    currentExponent >>>= 1;
  }
  return currentPowerResult;
}

const MODULUS_VALUE = 998244353;
const factorialCache = [1, 1];
const inverseFactorialCache = [1, 1];

function calculateFactorial(limitN) {
  if (limitN < 0) return 0;
  for (let cacheIdx = factorialCache.length; cacheIdx <= limitN; cacheIdx++) {
    factorialCache[cacheIdx] = multiplyAndModulo(factorialCache[cacheIdx - 1], cacheIdx);
  }
  return factorialCache[limitN];
}

function calculateInverseFactorial(limitN) {
  if (limitN < 0) return;
  if (!factorialCache[limitN]) {
    calculateFactorial(limitN);
  }

  inverseFactorialCache[limitN] = powerModulo(factorialCache[limitN], MODULUS_VALUE - 2);

  let currentN = limitN;
  while (currentN > 0 && !inverseFactorialCache[currentN - 1]) {
    inverseFactorialCache[currentN - 1] = multiplyAndModulo(inverseFactorialCache[currentN], currentN);
    currentN--;
  }
}

function combinationsModulo(totalItems, chooseItems) {
  if (chooseItems < 0 || chooseItems > totalItems) {
    return 0;
  }
  if (chooseItems === 0 || chooseItems === totalItems) {
    return 1;
  }
  if (chooseItems > totalItems / 2) {
    chooseItems = totalItems - chooseItems;
  }

  if (!inverseFactorialCache[totalItems]) {
    calculateInverseFactorial(totalItems);
  }

  return multiplyAndModulo(
    factorialCache[totalItems],
    inverseFactorialCache[chooseItems],
    inverseFactorialCache[totalItems - chooseItems]
  );
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
