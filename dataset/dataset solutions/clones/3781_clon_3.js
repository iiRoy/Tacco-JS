function solveProblem(inputStr) {
  const inputParts = inputStr.split(" ");
  const parsedNumbers = inputParts.map(val => +val);

  const totalItems = parsedNumbers[0];
  const costA = parsedNumbers[1];
  const costB = parsedNumbers[2];
  const targetValue = parsedNumbers[3];

  const sumOfCosts = costA + costB;
  let currentBlockCount = Math.floor(targetValue / sumOfCosts);

  let initialSolutionsContainer = [];
  let foundInitialSolution = false;

  for (let blockIdx = currentBlockCount; blockIdx >= 0; blockIdx--) {
    const remainingVal = targetValue - blockIdx * sumOfCosts;
    if (remainingVal < 0) {
      continue;
    }

    if (remainingVal % costA === 0) {
      initialSolutionsContainer.push(remainingVal / costA, 0);
      foundInitialSolution = true;
    }
    if (remainingVal % costB === 0) {
      initialSolutionsContainer.push(0, remainingVal / costB);
      foundInitialSolution = true;
    }

    if (foundInitialSolution) {
      currentBlockCount = blockIdx;
      break;
    }
  }

  if (!foundInitialSolution) {
    console.log(0);
    return;
  }

  let solutionPairs = initialSolutionsContainer;
  let finalResult = 0;

  const aBlocksPerC = (sumOfCosts % costA === 0) ? (sumOfCosts / costA) : 0;
  const bBlocksPerC = (sumOfCosts % costB === 0) ? (sumOfCosts / costB) : 0;

  while (solutionPairs.length > 0 && currentBlockCount >= 0) {
    const iterationResult = processSolutionIteration(
      solutionPairs,
      totalItems,
      currentBlockCount,
      aBlocksPerC,
      bBlocksPerC,
      finalResult
    );
    solutionPairs = iterationResult.newSolutions;
    finalResult = iterationResult.updatedResult;
    currentBlockCount--;
  }

  console.log(finalResult);
}

function processSolutionIteration(currentSolutions, totalItems, currentBlockCount, costARatio, costBRatio, currentAccumulatedResult) {
  let nextSolutions = [];
  let uniquePairsTracker = new Set();

  for (let pairIdx = 0; pairIdx < currentSolutions.length; pairIdx += 2) {
    const numA = currentSolutions[pairIdx];
    const numB = currentSolutions[pairIdx + 1];
    const pairKey = `${numA}a${numB}`;

    if (uniquePairsTracker.has(pairKey)) {
      continue;
    }

    if (numA < 0 || numB < 0 || currentBlockCount + numA + numB > totalItems) {
      continue;
    }

    uniquePairsTracker.add(pairKey);

    const combinationsProduct = multiplyMod(
      combinationsMod(totalItems, currentBlockCount),
      combinationsMod(totalItems - currentBlockCount, numA),
      combinationsMod(totalItems - currentBlockCount - numA, numB)
    );
    currentAccumulatedResult = (currentAccumulatedResult + combinationsProduct) % MODULUS;

    nextSolutions.push(numA + 1, numB + 1);
    if (costARatio) {
      nextSolutions.push(numA + costARatio, numB);
    }
    if (costBRatio) {
      nextSolutions.push(numA, numB + costBRatio);
    }
  }
  return { newSolutions: nextSolutions, updatedResult: currentAccumulatedResult };
}

function multiplyMod() {
  let resultVal = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    const currentArg = arguments[i];
    resultVal = (resultVal >>> 16) * currentArg % MODULUS * 0x10000 + (resultVal & 0xFFFF) * currentArg;
    resultVal %= MODULUS;
  }
  return resultVal;
}

function powerMod(baseVal, exponent) {
  let resultVal = 1;
  let currentBase = baseVal;
  while (exponent > 0) {
    if (exponent & 1) resultVal = multiplyMod(currentBase, resultVal);
    currentBase = multiplyMod(currentBase, currentBase);
    exponent >>>= 1;
  }
  return resultVal;
}

const MODULUS = 998244353;
const factorials = [1, 1];
const inverseFactorials = [1, 1];

function calculateFactorialMod(num) {
  for (let i = factorials.length; i <= num; i++) {
    factorials[i] = multiplyMod(factorials[i - 1], i);
  }
  return factorials[num];
}

function calculateInverseFactorialMod(num) {
  if (!factorials[num]) calculateFactorialMod(num);
  inverseFactorials[num] = powerMod(factorials[num], MODULUS - 2);
  let currentNum = num;
  while (!inverseFactorials[currentNum - 1] && currentNum > 1) {
    inverseFactorials[currentNum - 1] = multiplyMod(inverseFactorials[currentNum], currentNum);
    currentNum--;
  }
}

function combinationsMod(nVal, rVal) {
  if (rVal < 0 || rVal > nVal) return 0;
  if (!inverseFactorials[nVal]) calculateInverseFactorialMod(nVal);
  return multiplyMod(factorials[nVal], inverseFactorials[rVal], inverseFactorials[nVal - rVal]);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
