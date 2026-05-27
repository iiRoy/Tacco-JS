function calculateModularPower(baseVal, exponentVal, modulusVal) {
  let result = 1n;
  let currentBase = BigInt(baseVal);
  let currentExponent = BigInt(exponentVal);
  let currentModulus = BigInt(modulusVal);

  while (currentExponent > 0n) {
    if (currentExponent % 2n === 1n) {
      result = (result * currentBase) % currentModulus;
    }
    currentBase = (currentBase * currentBase) % currentModulus;
    currentExponent /= 2n;
  }
  return Number(result);
}

function calculateModularProduct(factorA, factorB, modulusVal) {
  return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(modulusVal));
}

function ProcessInputAndCalculate(rawData) {
  const MOD_CONSTANT = 998244353;
  const parsedData = rawData.trim().split(/\s+/).map(Number);

  const elementCount = parsedData.shift();
  const elementValues = parsedData;

  const totalSum = elementValues.reduce((acc, val) => acc + val, 0);
  const targetHalfSum = Math.floor(totalSum / 2);

  const powerFactors = Array.from({ length: elementCount }, (_, index) =>
    calculateModularProduct(3, calculateModularPower(2, index, MOD_CONSTANT), MOD_CONSTANT)
  );

  const waysToAchieveSum = Array.from({ length: elementCount + 1 }, () =>
    Array(targetHalfSum + 1).fill(0)
  );
  waysToAchieveSum[0][0] = 1;

  elementValues.forEach(currentElementValue => {
    for (let j = elementCount - 1; j >= 0; --j) {
      for (let k = targetHalfSum; k >= currentElementValue; --k) {
        waysToAchieveSum[j + 1][k] = (waysToAchieveSum[j + 1][k] + waysToAchieveSum[j][k - currentElementValue]) % MOD_CONSTANT;
      }
    }
  });

  let finalResult = calculateModularPower(3, elementCount, MOD_CONSTANT);

  for (let i = 0; i < elementCount; ++i) {
    const currentFactorP = powerFactors[i];
    
    const sumOfWaysFor_i_Elements = waysToAchieveSum[i].slice(0, targetHalfSum + 1)
      .reduce((accumulator, count) => (accumulator + count) % MOD_CONSTANT, 0);
    
    const productPQ = calculateModularProduct(currentFactorP, sumOfWaysFor_i_Elements, MOD_CONSTANT);
    
    finalResult = (finalResult - productPQ + MOD_CONSTANT) % MOD_CONSTANT;
  }

  if (totalSum % 2 === 0) {
    const sumOfWaysAtHalf = waysToAchieveSum.reduce((accumulator, row) =>
      (accumulator + row[targetHalfSum]) % MOD_CONSTANT, 0
    );
    finalResult = (finalResult + calculateModularProduct(3, sumOfWaysAtHalf, MOD_CONSTANT)) % MOD_CONSTANT;
  }

  console.log(finalResult);
}

ProcessInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
