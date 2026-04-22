function computeCompositeSum(sourceData) {
  const numberMatches = sourceData.split('\n')[0].matchAll(/(\d+)n?/g);
  const parsedNumbers = Array.from(numberMatches).map(match => BigInt(match[1]));

  const majorCount = parsedNumbers[0];
  const distinctChoices = parsedNumbers[1];
  const limitValue = parsedNumbers[2];

  const calculationModulus = 998244353n;

  function calculateModularExponent(baseVal, exponentVal, modulusVal) {
    if (exponentVal === 0n) return 1n;
    if (exponentVal === 1n) return baseVal % modulusVal;
    
    const halfResult = calculateModularExponent(baseVal, exponentVal / 2n, modulusVal);
    let squaredResult = (halfResult * halfResult) % modulusVal;

    if (exponentVal % 2n === 1n) {
      squaredResult = (squaredResult * baseVal) % modulusVal;
    }
    return squaredResult;
  }

  function deriveModularInverse(valueToInvert, modulusVal) {
    return calculateModularExponent(valueToInvert, modulusVal - 2n, modulusVal);
  }

  function computeCombinations(totalItems, chosenItems, modulusVal) {
    if (chosenItems < 0n || chosenItems > totalItems) return 0n;
    if (chosenItems === 0n || chosenItems === totalItems) return 1n;
    
    if (chosenItems > totalItems / 2n) {
      chosenItems = totalItems - chosenItems;
    }

    let numeratorAccumulator = 1n;
    let denominatorAccumulator = 1n;

    for (let currentFactor = 0n; currentFactor < chosenItems; currentFactor++) {
      numeratorAccumulator = (numeratorAccumulator * (totalItems - currentFactor)) % modulusVal;
      denominatorAccumulator = (denominatorAccumulator * (currentFactor + 1n)) % modulusVal;
    }

    const inverseDenominator = deriveModularInverse(denominatorAccumulator, modulusVal);
    return (numeratorAccumulator * inverseDenominator) % modulusVal;
  }

  const baseForPower = distinctChoices - 1n;
  const initialPowerExponent = (majorCount - 2n - limitValue) > 0n ? (majorCount - 2n - limitValue) : 0n;
  
  let precomputedPowerFactor;
  if (baseForPower === 0n) {
    precomputedPowerFactor = 1n;
  } else {
    precomputedPowerFactor = calculateModularExponent(baseForPower, initialPowerExponent, calculationModulus);
  }

  const totalSumComponent = Array.from({ length: Number(limitValue) + 1 }, (_, index) => BigInt(index))
    .reduce((currentAccumulation, loopIndex) => {
      const combinationResult = computeCombinations(majorCount - 1n, loopIndex, calculationModulus);
      const dynamicPowerTerm = calculateModularExponent(baseForPower, limitValue - loopIndex, calculationModulus);
      const termContribution = (combinationResult * dynamicPowerTerm) % calculationModulus;
      return (currentAccumulation + termContribution) % calculationModulus;
    }, 0n);

  let finalCalculatedValue;
  if (distinctChoices === 1n) {
    finalCalculatedValue = (distinctChoices * precomputedPowerFactor % calculationModulus * totalSumComponent) % calculationModulus;
  } else {
    finalCalculatedValue = (distinctChoices * precomputedPowerFactor % calculationModulus * (distinctChoices - 1n) % calculationModulus * totalSumComponent) % calculationModulus;
  }

  console.log('%s', finalCalculatedValue.toString());
  return finalCalculatedValue;
}

if (typeof require !== 'undefined' && require.main === module) {
  const fileSystem = require("fs");
  const inputData = fileSystem.readFileSync("/dev/stdin", "utf8");
  computeCompositeSum(inputData);
}