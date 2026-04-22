const acquireInput = () => {
  return require("node:fs").readFileSync(0, "utf8").trim();
};

const dispatchResult = (payload) => {
  console.log(payload);
};

const processCalculation = (rawData) => {
  const numericalLimit = Number(rawData);
  const productModulus = 1000000007;

  const isCompositeMark = new Array(numericalLimit + 1).fill(false);
  const detectedPrimes = [];

  for (let primaryIndex = 2; primaryIndex <= numericalLimit; ++primaryIndex) {
    if (!isCompositeMark[primaryIndex]) {
      detectedPrimes.push(primaryIndex);
      for (let secondaryIndex = primaryIndex * primaryIndex; secondaryIndex <= numericalLimit; secondaryIndex += primaryIndex) {
        isCompositeMark[secondaryIndex] = true;
      }
    }
  }

  let cumulativeDivisorCount = 1;

  for (const currentPrimeFactor of detectedPrimes) {
    let factorExponent = 0;
    let powerAccumulator = currentPrimeFactor;

    while (powerAccumulator <= numericalLimit) {
      factorExponent = (factorExponent + Math.floor(numericalLimit / powerAccumulator));
      if (powerAccumulator > numericalLimit / currentPrimeFactor) {
          break;
      }
      powerAccumulator *= currentPrimeFactor;
    }
    cumulativeDivisorCount = (cumulativeDivisorCount * (factorExponent + 1)) % productModulus;
  }

  dispatchResult(cumulativeDivisorCount);
};

processCalculation(acquireInput());