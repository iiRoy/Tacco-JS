function checkSmallPrimeFactors(candidate, prime) {
  return candidate !== prime && candidate % prime === 0;
}

function checkPrimality(candidateNum) {
  if (candidateNum === 1) {
    return false;
  }

  if (candidateNum === 2) {
    return true;
  }

  if (candidateNum % 2 === 0) {
    return false;
  }

  if (checkSmallPrimeFactors(candidateNum, 3)) {
    return false;
  }
  if (checkSmallPrimeFactors(candidateNum, 5)) {
    return false;
  }
  if (checkSmallPrimeFactors(candidateNum, 7)) {
    return false;
  }

  const upperLimit = Math.sqrt(candidateNum);
  for (let divisorCheck = 3; divisorCheck <= upperLimit; divisorCheck += 2) {
    if (candidateNum % divisorCheck === 0) {
      return false;
    }
  }
  return true;
}

function computeGCD(firstVal, secondVal) {
  if (secondVal === 0) {
    return firstVal;
  }
  const remainder = firstVal % secondVal;
  return computeGCD(secondVal, remainder);
}

function processInput(rawInputString) {
  const lines = rawInputString.split("\n");
  const firstLine = lines[0];
  const inputParts = firstLine.split(" ");

  const numA = Number.parseInt(inputParts[0], 10);
  const numB = Number.parseInt(inputParts[1], 10);

  const greatestCommonDivisor = computeGCD(numA, numB);

  const divisorsOfGCD = [];

  for (let divisorIdx = 1; divisorIdx <= greatestCommonDivisor; divisorIdx++) {
    const isDivisible = greatestCommonDivisor % divisorIdx === 0;
    if (isDivisible) {
      divisorsOfGCD.push(divisorIdx);
    }
  }

  let primeDivisorCount = 0;
  for (let primeCheckIdx = 0; primeCheckIdx < divisorsOfGCD.length; primeCheckIdx++) {
    const currentDivisor = divisorsOfGCD[primeCheckIdx];
    if (checkPrimality(currentDivisor)) {
      primeDivisorCount++;
    }
  }

  console.log(primeDivisorCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
