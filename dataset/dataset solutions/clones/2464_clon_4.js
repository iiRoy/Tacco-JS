"use strict";

const inputProcessor = (function() {
  function createInputReaderModule(inputContent) {
    let lineBuffer = inputContent.trim().split(/\r?\n/);
    let currentLineWords = [];

    function fetchNextDatum(asStringOutput = false) {
      if (currentLineWords.length === 0) {
        if (lineBuffer.length === 0) {
          throw new Error("End of input stream reached.");
        }
        currentLineWords = lineBuffer.shift().split(/\s+/).filter(Boolean);
        if (currentLineWords.length === 0) {
          return fetchNextDatum(asStringOutput);
        }
      }
      const item = currentLineWords.shift();
      return asStringOutput ? item : Number(item);
    }

    function fetchLineData(asStringOutput = false) {
      if (lineBuffer.length === 0) {
        throw new Error("End of input stream for line data.");
      }
      const lineText = lineBuffer.shift();
      const lineItems = lineText.split(/\s+/).filter(Boolean);
      return asStringOutput ? lineItems : lineItems.map(Number);
    }

    function fetchMatrixData(numRows, asStringOutput = false) {
      const resultMatrix = [];
      for (let i = 0; i < numRows; i++) {
        resultMatrix.push(fetchLineData(asStringOutput));
      }
      return resultMatrix;
    }

    function fetchRawLines(numLines, asStringOutput = false) {
      const fetchedLines = [];
      for (let i = 0; i < numLines; i++) {
        if (lineBuffer.length === 0) {
          throw new Error("Not enough raw lines available.");
        }
        const rawLine = lineBuffer.shift();
        fetchedLines.push(asStringOutput ? rawLine : Number(rawLine));
      }
      return fetchedLines;
    }

    return {
      getVal: fetchNextDatum,
      getLn: fetchLineData,
      getMx: fetchMatrixData,
      getRl: fetchRawLines
    };
  }
  return createInputReaderModule;
})();
const inputData = inputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function generateNestedArray(fillValue, ...dimensions) {
  if (dimensions.length === 0) {
    return fillValue;
  }
  const currentDimension = dimensions[0];
  const remainingDimensions = dimensions.slice(1);
  return Array.from({
    length: currentDimension
  }, () => generateNestedArray(fillValue, ...remainingDimensions));
}

const MathHelper = (function() {
  const PRIME_CONSTANT = 998244353;
  let memoizedFactorials = null;
  let memoizedInvFactorials = null;

  function calculateProduct(...numbers) {
    let currentProduct = 1n;
    const modulusBigInt = BigInt(PRIME_CONSTANT);
    for (const num of numbers) {
      currentProduct = (currentProduct * BigInt(num)) % modulusBigInt;
    }
    return Number(currentProduct);
  }

  function findModularInverse(value) {
    let [a, b] = [BigInt(value), BigInt(PRIME_CONSTANT)];
    let [x0, x1] = [1n, 0n];

    while (b !== 0n) {
      const quotient = a / b;
      [a, b] = [b, a % b];
      [x0, x1] = [x1, x0 - quotient * x1];
    }
    return Number((x0 % BigInt(PRIME_CONSTANT) + BigInt(PRIME_CONSTANT)) % BigInt(PRIME_CONSTANT));
  }

  function computePower(base, exponent) {
    let result = 1n;
    let currentBase = BigInt(base) % BigInt(PRIME_CONSTANT);
    let currentExponent = exponent;

    while (currentExponent > 0) {
      if (currentExponent % 2 === 1) {
        result = (result * currentBase) % BigInt(PRIME_CONSTANT);
      }
      currentBase = (currentBase * currentBase) % BigInt(PRIME_CONSTANT);
      currentExponent = Math.floor(currentExponent / 2);
    }
    return Number(result);
  }

  function prepareCombinatorialData(upperBound) {
    memoizedFactorials = new Array(upperBound + 1);
    memoizedInvFactorials = new Array(upperBound + 1);
    const modulusBigInt = BigInt(PRIME_CONSTANT);

    memoizedFactorials[0] = 1n;
    for (let i = 1; i <= upperBound; i++) {
      memoizedFactorials[i] = (memoizedFactorials[i - 1] * BigInt(i)) % modulusBigInt;
    }

    memoizedInvFactorials[upperBound] = BigInt(findModularInverse(Number(memoizedFactorials[upperBound])));
    for (let i = upperBound - 1; i >= 0; i--) {
      memoizedInvFactorials[i] = (memoizedInvFactorials[i + 1] * BigInt(i + 1)) % modulusBigInt;
    }
    memoizedInvFactorials[0] = 1n;

    for (let i = 0; i <= upperBound; i++) {
      memoizedFactorials[i] = Number(memoizedFactorials[i]);
      memoizedInvFactorials[i] = Number(memoizedInvFactorials[i]);
    }
  }

  function getCombinations(n, r) {
    if (r < 0 || r > n) {
      return 0;
    }
    if (!memoizedFactorials || !memoizedInvFactorials || n >= memoizedFactorials.length) {
      throw new Error("Combinatorial data not prepared or limit exceeded for n: " + n);
    }
    return calculateProduct(memoizedFactorials[n], memoizedInvFactorials[r], memoizedInvFactorials[n - r]);
  }

  return {
    MOD: PRIME_CONSTANT,
    multiply: calculateProduct,
    inverse: findModularInverse,
    power: computePower,
    setupCombinatorics: prepareCombinatorialData,
    combinations: getCombinations
  };
})();

function solveCurrentChallenge() {
  const problemDimension = inputData.getVal();

  let finalOutcome = MathHelper.power(3, problemDimension);

  MathHelper.setupCombinatorics(problemDimension);

  let currentTwoPower = 1;

  for (let currentIterationValue = problemDimension; currentIterationValue > Math.floor(problemDimension / 2); currentIterationValue--) {
    currentTwoPower = MathHelper.multiply(currentTwoPower, 2);
    const combinationFactor = MathHelper.combinations(problemDimension, currentIterationValue);
    const termToSubtract = MathHelper.multiply(combinationFactor, currentTwoPower);

    finalOutcome = (finalOutcome - termToSubtract + MathHelper.MOD) % MathHelper.MOD;
  }

  return (finalOutcome + MathHelper.MOD) % MathHelper.MOD;
}

console.log(solveCurrentChallenge());