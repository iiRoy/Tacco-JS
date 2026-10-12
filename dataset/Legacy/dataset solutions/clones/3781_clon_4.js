const primeModulus = 998244353;

const modMultiply = (...factors) => {
  return factors.reduce((accumulator, currentFactor) => {
    let highPart = (accumulator >>> 16) * currentFactor;
    let lowPart = (accumulator & 0xFFFF) * currentFactor;
    let result = (highPart % primeModulus * 0x10000 + lowPart) % primeModulus;
    return result;
  });
};

const modPower = (base, exponent) => {
  if (exponent === 0) return 1;
  if (exponent === 1) return base % primeModulus;
  
  const halfPower = modPower(base, Math.floor(exponent / 2));
  let result = modMultiply(halfPower, halfPower);
  
  if (exponent % 2 === 1) {
    result = modMultiply(result, base);
  }
  return result;
};

const factorialCache = [1, 1];
const invFactorialCache = [1, 1];

const computeFactorial = (limit) => {
  for (let idx = factorialCache.length; idx <= limit; idx++) {
    factorialCache[idx] = modMultiply(factorialCache[idx - 1], idx);
  }
  return factorialCache[limit];
};

const computeInvFactorial = (limit) => {
  if (!factorialCache[limit]) {
    computeFactorial(limit);
  }
  if (!invFactorialCache[limit]) {
    invFactorialCache[limit] = modPower(factorialCache[limit], primeModulus - 2);
    for (let idx = limit - 1; idx >= 0 && !invFactorialCache[idx]; idx--) {
      invFactorialCache[idx] = modMultiply(invFactorialCache[idx + 1], idx + 1);
    }
  }
  return invFactorialCache[limit];
};

const combinationsMod = (total, choose) => {
  if (choose < 0 || choose > total) return 0;
  
  computeInvFactorial(total);
  
  return modMultiply(factorialCache[total], invFactorialCache[choose], invFactorialCache[total - choose]);
};

function ProcessInput(inputString) {
  const parsedValues = inputString.split(" ").map(Number);
  const [totalItems, firstCost, secondCost, budget] = parsedValues;
  const combinedCost = firstCost + secondCost;

  let initialJ = -1;
  let initialPairs = [];

  const maxPossibleJ = Math.floor(budget / combinedCost);
  
  for (let currentJ = maxPossibleJ; currentJ >= 0; currentJ--) {
      const remainingBudget = budget - currentJ * combinedCost;
      if (remainingBudget < 0) continue;

      let foundForCurrentJ = false;
      const tempPairs = [];

      if (remainingBudget % firstCost === 0) {
          tempPairs.push(remainingBudget / firstCost, 0);
          foundForCurrentJ = true;
      }
      if (remainingBudget % secondCost === 0) {
          tempPairs.push(0, remainingBudget / secondCost);
          foundForCurrentJ = true;
      }

      if (foundForCurrentJ) {
          initialJ = currentJ;
          initialPairs = tempPairs;
          break;
      }
  }

  if (initialJ === -1) {
    console.log(0);
    return;
  }

  const aToC = (combinedCost % firstCost === 0) ? (combinedCost / firstCost) : 0;
  const bToC = (combinedCost % secondCost === 0) ? (combinedCost / secondCost) : 0;

  const finalResult = Array.from({ length: initialJ + 1 }, (_, idx) => initialJ - idx)
    .reduce(([currentAnswer, currentPairs], currentJ) => {
      if (currentPairs.length === 0) {
        return [currentAnswer, []];
      }

      const nextPairs = [];
      const seenCurrentPairs = new Set();

      for (let i = 0; i < currentPairs.length; i += 2) {
        const xVal = currentPairs[i];
        const yVal = currentPairs[i + 1];
        const pairKey = `${xVal}a${yVal}`;

        if (seenCurrentPairs.has(pairKey)) {
          continue;
        }
        seenCurrentPairs.add(pairKey);

        if (xVal < 0 || yVal < 0 || currentJ + xVal + yVal > totalItems) {
          continue;
        }

        const term1 = combinationsMod(totalItems, currentJ);
        const term2 = combinationsMod(totalItems - currentJ, xVal);
        const term3 = combinationsMod(totalItems - currentJ - xVal, yVal);
        
        currentAnswer = (currentAnswer + modMultiply(term1, term2, term3)) % primeModulus;

        nextPairs.push(xVal + 1, yVal + 1);
        if (aToC) nextPairs.push(xVal + aToC, yVal);
        if (bToC) nextPairs.push(xVal, yVal + bToC);
      }
      return [currentAnswer, nextPairs];
    }, [0, initialPairs]);

  console.log(finalResult[0]);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
