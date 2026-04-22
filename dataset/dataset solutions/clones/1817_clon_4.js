function processInputData(entryString) {
  const entryValue = Number(entryString);

  if (entryValue === 0) {
    console.log(0);
    return;
  }

  if (entryValue === 1) {
    console.log(1);
    return;
  }

  function decomposeIntoPrimes(numericTarget) {
    let currentTrialDivisor = 2;
    let currentRemainder = numericTarget;
    const primeFactorsWithExponents = new Map();

    while (currentRemainder > 1) {
      if (currentRemainder % currentTrialDivisor === 0) {
        let count = 0;
        while (currentRemainder % currentTrialDivisor === 0) {
          currentRemainder /= currentTrialDivisor;
          count++;
        }
        primeFactorsWithExponents.set(currentTrialDivisor, count);
      }
      currentTrialDivisor++;
      if (currentTrialDivisor * currentTrialDivisor > currentRemainder && currentRemainder > 1) {
        primeFactorsWithExponents.set(currentRemainder, (primeFactorsWithExponents.get(currentRemainder) || 0) + 1);
        break;
      }
    }
    return primeFactorsWithExponents;
  }

  function locateTriangularRoot(targetSum) {
    if (targetSum <= 0) {
      return 0;
    }
    const quadraticDiscriminant = 1 + 8 * targetSum;
    const squareRootOfDiscriminant = Math.sqrt(quadraticDiscriminant);
    const calculatedRoot = Math.ceil((-1 + squareRootOfDiscriminant) / 2);
    return calculatedRoot;
  }

  const primeFactorsMap = decomposeIntoPrimes(entryValue);
  let accumulatedIndexSum = 0;

  for (const exponentValue of primeFactorsMap.values()) {
    accumulatedIndexSum += locateTriangularRoot(exponentValue);
  }

  console.log(accumulatedIndexSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());