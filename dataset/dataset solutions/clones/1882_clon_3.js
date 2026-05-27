function solveProblem(rawInputData) {
  const lines = rawInputData.split("\n");
  const firstLineParts = lines[0].split(" ");

  const primeMod = 998244353n;
  const countN = BigInt(parseInt(firstLineParts[0]));
  const countM = BigInt(parseInt(firstLineParts[1]));
  const limitK = BigInt(parseInt(firstLineParts[2]));

  let finalAnswer = 0n;
  const mMinusOne = countM - 1n;

  // Calculate (M-1)^(N-2-K) or (M-1)^0 if N-2-K < 0
  const effectiveExponent = countN - 2n - limitK;
  let currentFactor = powerMod(mMinusOne, effectiveExponent > 0n ? effectiveExponent : 0n, primeMod);

  for (let loopIdx = limitK; loopIdx >= 0n; loopIdx--) {
    const combinationsTerm = calculateCombinationsMod(countN - 1n, loopIdx);
    const termProduct = (combinationsTerm * countM) % primeMod;
    const currentTerm = (termProduct * currentFactor) % primeMod;
    finalAnswer = (finalAnswer + currentTerm) % primeMod;
    currentFactor = (currentFactor * mMinusOne) % primeMod;
  }

  function computeProductRangeMod(startVal, endVal) {
    let productAccumulator = 1n;
    for (let currentNum = startVal; currentNum <= endVal; currentNum++) {
      productAccumulator = (productAccumulator * currentNum) % primeMod;
    }
    return productAccumulator;
  }

  function calculateCombinationsMod(nVal, chooseK) {
    if (nVal === chooseK || chooseK === 0n) {
      return 1n;
    } else {
      // The original code's optimization: C(n, k) = C(n, n-k).
      // It effectively computes C(n, min(k, n-k)) by adjusting the 'r' value.
      let tempR = chooseK;
      if (tempR < nVal - tempR) {
        tempR = nVal - tempR;
      }
      const inverseFactorial = inverseMod(computeProductRangeMod(1n, nVal - tempR), primeMod);
      const numeratorProduct = computeProductRangeMod(tempR + 1n, nVal);
      return (numeratorProduct * inverseFactorial) % primeMod;
    }
  }

  function powerMod(baseNum, powerExp, modulus) {
    let resultVal = 1n;
    while (powerExp > 0n) {
      if (powerExp & 1n) resultVal = (resultVal * baseNum) % modulus;
      baseNum = (baseNum * baseNum) % modulus;
      powerExp >>= 1n;
    }
    return resultVal;
  }

  function inverseMod(num, modulus) {
    return powerMod(num, modulus - 2n, modulus);
  }

  console.log('%s', finalAnswer.toString());
  return finalAnswer;
}

function runTestCases(testNum) {
  const inputElement = document.getElementById("input" + testNum);
  const outputElement = document.getElementById("output" + testNum);
  if (!inputElement || !outputElement) {
    console.error(`Elements for test ${testNum} not found.`);
    return;
  }
  const inputData = inputElement.value;
  const actualAnswer = solveProblem(inputData);
  const expectedOutput = outputElement.value.split("\n")[0];

  let testResult = "WA";
  if (actualAnswer.toString() === expectedOutput) {
    testResult = "AC";
  }
  const resultElement = document.getElementById("result" + testNum);
  if (resultElement) {
    resultElement.innerHTML = testResult;
  }
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
