"use strict";

class InputProcessor {
  constructor(sourceText, valueParser = Number) {
    this.sourceLines = sourceText.split("\n");
    this.currentColumnIndex = 0;
    this.currentLineIndex = 0;
    this.valueParser = valueParser;
  }

  getNextToken() {
    const currentLineContent = this.sourceLines[this.currentLineIndex];
    if (!currentLineContent) {
      return undefined;
    }

    const tokensOnLine = currentLineContent.trim().split(" ");
    const tokenValue = tokensOnLine[this.currentColumnIndex];
    this.currentColumnIndex++;

    if (tokensOnLine.length === this.currentColumnIndex) {
      this.currentColumnIndex = 0;
      this.currentLineIndex++;
    }
    return this.valueParser(tokenValue);
  }

  getAllTokensOnLine() {
    const currentLineContent = this.sourceLines[this.currentLineIndex];
    if (!currentLineContent) {
      return undefined;
    }
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
    return currentLineContent.split(" ").map(this.valueParser);
  }
}

function generatePrimesUpTo(upperBound) {
  const arraySize = upperBound + 1;
  const isPrimeTracker = new Array(arraySize).fill(true);
  isPrimeTracker[0] = false;
  isPrimeTracker[1] = false;

  const foundPrimes = [];
  for (let numCandidate = 2; numCandidate <= upperBound; numCandidate++) {
    if (isPrimeTracker[numCandidate]) {
      foundPrimes.push(numCandidate);
      for (let multiple = numCandidate * numCandidate; multiple <= upperBound; multiple += numCandidate) {
        isPrimeTracker[multiple] = false;
      }
    }
  }
  return foundPrimes;
}

const primeCache = generatePrimesUpTo(100000);

function processData(rawData) {
  const dataParser = new InputProcessor(rawData);

  const N = dataParser.getNextToken();
  const dataArray = [];

  for (let k = 0; k <= N; k++) {
    dataArray.push(dataParser.getNextToken());
  }
  dataArray.reverse();

  let currentGCD = dataArray[0];
  currentGCD = dataArray.slice(1).reduce((acc, val) => computeGreatestCommonDivisor(acc, val), currentGCD);

  dataArray.forEach((val, index) => {
    dataArray[index] = val / currentGCD;
  });

  const potentialPrimes = new Set();

  const checkPrimeCondition = (primeVal, arr, size) => {
    if (arr[0] % primeVal !== 0) {
      return false;
    }
    const stepDecrement = primeVal - 1;
    for (let i = 1; i < primeVal; i++) {
      let innerLoopIndex = i;
      let currentSum = 0;
      while (innerLoopIndex <= size) {
        currentSum += arr[innerLoopIndex];
        innerLoopIndex += stepDecrement;
      }
      if (currentSum % primeVal !== 0) {
        return false;
      }
    }
    return true;
  };

  for (const p of primeCache) {
    if (checkPrimeCondition(p, dataArray, N)) {
      potentialPrimes.add(p);
    }
  }

  const factorOutPrime = (num, primeFactor) => {
    while (num > 1 && num % primeFactor === 0) {
      num /= primeFactor;
    }
    return num;
  };

  let primeIteratorIndex = 0;
  while (currentGCD > 1 && primeIteratorIndex < primeCache.length) {
    const currentFactor = primeCache[primeIteratorIndex];
    if (currentGCD % currentFactor === 0) {
      potentialPrimes.add(currentFactor);
      currentGCD = factorOutPrime(currentGCD, currentFactor);
    }
    primeIteratorIndex++;
  }
  if (currentGCD > 1) {
    potentialPrimes.add(currentGCD);
  }

  const finalResults = Array.from(potentialPrimes).sort((a, b) => a - b);

  for (const res of finalResults) {
    console.log(res);
  }
}

function computeGreatestCommonDivisor(valA, valB) {
  let currentA = valA;
  let currentB = valB;
  while (currentB !== 0) {
    const remainder = currentA % currentB;
    currentA = currentB;
    currentB = remainder;
  }
  return currentA;
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
