function obtainGreatestCommonDivisor(firstOperand, secondOperand) {
  while (secondOperand !== 0) {
    let remainder = firstOperand % secondOperand;
    firstOperand = secondOperand;
    secondOperand = remainder;
  }
  return firstOperand;
}

function extractUniquePrimeFactors(targetValue) {
  const uniquePrimes = new Set();

  if (targetValue <= 1) { // 0 and 1 have no prime factors
    return uniquePrimes;
  }

  // Handle factor 2
  while (targetValue > 1 && targetValue % 2 === 0) {
    uniquePrimes.add(2);
    targetValue /= 2;
  }

  // Handle odd factors
  for (let currentFactor = 3; currentFactor * currentFactor <= targetValue; currentFactor += 2) {
    while (targetValue > 1 && targetValue % currentFactor === 0) {
      uniquePrimes.add(currentFactor);
      targetValue /= currentFactor;
    }
  }

  // If targetValue is still greater than 1, it must be a prime factor itself
  if (targetValue > 1) {
    uniquePrimes.add(targetValue);
  }

  return uniquePrimes;
}

function processData(sourceInput) {
  const parts = sourceInput.trim().split(/\s+/).map(Number);
  const operandA = parts[0];
  const operandB = parts[1];

  const commonDivisorValue = obtainGreatestCommonDivisor(operandA, operandB);
  
  const primeFactorSet = extractUniquePrimeFactors(commonDivisorValue);
  
  console.log(primeFactorSet.size);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));