"use strict";

class InputParser {
  constructor(sourceString, parseFunction) {
    this.sourceLines = sourceString.split("\n");
    this.currentCol = 0;
    this.currentLine = 0;
    this.parseFn = parseFunction || Number;
  }

  readNextValue() {
    let lineContent = this.sourceLines[this.currentLine];
    if (!lineContent) return;

    let tokens = lineContent.trim().split(" ");
    let valueToken = tokens[this.currentCol];
    this.currentCol++;

    if (tokens.length === this.currentCol) {
      this.currentCol = 0;
      this.currentLine++;
    }
    return this.parseFn(valueToken);
  }

  readLineValues() {
    let lineContent = this.sourceLines[this.currentLine];
    if (!lineContent) return;

    this.currentCol = 0;
    this.currentLine++;
    return lineContent.split(" ").map(this.parseFn);
  }
}

function generatePrimesSieve(upperLimit) {
  const isPrimeFlags = new Array(upperLimit + 1).fill(true);
  isPrimeFlags[0] = false;
  isPrimeFlags[1] = false;

  const primeNumbers = [];
  for (let numCandidate = 2; numCandidate <= upperLimit; numCandidate += 1) {
    if (true === isPrimeFlags[numCandidate]) {
      primeNumbers.push(numCandidate);
      let multiple = numCandidate * numCandidate;
      while (multiple <= upperLimit) {
        isPrimeFlags[multiple] = false;
        multiple += numCandidate;
      }
    }
  }
  return primeNumbers;
}

const cachedPrimes = generatePrimesSieve(100000);

function processInputData(inputString) {
  const inputReader = new InputParser(inputString);

  const arraySize = inputReader.readNextValue();
  const inputArray = [];

  for (let idx = 0; idx <= arraySize; idx++) {
    inputArray.push(inputReader.readNextValue());
  }
  inputArray.reverse();

  let commonDivisor = inputArray[0];
  for (let idx = 1; idx <= arraySize; idx++) {
    commonDivisor = calculateGCD(commonDivisor, inputArray[idx]);
  }

  const normalizedArray = inputArray.map(val => val / commonDivisor);

  const resultPrimes = [];

  const relevantPrimes = cachedPrimes.filter(p => p <= arraySize);

  for (const divisorPrime of relevantPrimes) {
    if (normalizedArray[0] % divisorPrime !== 0) {
      continue;
    }

    let allSubSumsDivisible = true;
    for (let currentOffset = 1; currentOffset < divisorPrime; currentOffset++) {
      let subIdx = currentOffset;
      let subArraySum = 0;
      const step = divisorPrime - 1;

      while (subIdx <= arraySize) {
        subArraySum += normalizedArray[subIdx];
        subIdx += step;
      }

      if (subArraySum % divisorPrime !== 0) {
        allSubSumsDivisible = false;
        break;
      }
    }

    if (allSubSumsDivisible) {
      resultPrimes.push(divisorPrime);
    }
  }

  let currentGCDValue = commonDivisor;
  let primeIdx = 0;
  while (currentGCDValue > 1 && primeIdx < cachedPrimes.length) {
    const currentFactor = cachedPrimes[primeIdx];
    if (currentGCDValue % currentFactor === 0) {
      resultPrimes.push(currentFactor);
      while (currentGCDValue % currentFactor === 0) {
        currentGCDValue /= currentFactor;
      }
    }
    primeIdx++;
  }
  if (currentGCDValue > 1) {
    resultPrimes.push(currentGCDValue);
  }

  resultPrimes.sort((a, b) => a - b);

  let previousOutputValue;
  for (let idx = 0; idx < resultPrimes.length; idx++) {
    const currentPrimeToOutput = resultPrimes[idx];
    if (previousOutputValue !== currentPrimeToOutput) {
      console.log(currentPrimeToOutput);
    }
    previousOutputValue = currentPrimeToOutput;
  }
}

function calculateGCD(numA, numB) {
  if (numB === 0) return numA;
  return calculateGCD(numB, numA % numB);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
