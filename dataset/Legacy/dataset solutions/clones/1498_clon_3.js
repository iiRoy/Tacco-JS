"use strict";
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenBuffer = rawData.split(/ |\n/);
let tokenIndex = 0;

function readInt() { return +tokenBuffer[tokenIndex++]; }
function readString() { return tokenBuffer[tokenIndex++]; }
function readBigInt() { return BigInt(tokenBuffer[tokenIndex++]); }

function readIntArray(count, mapToNum = true) {
  const slice = tokenBuffer.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return mapToNum ? slice.map(val => +val) : slice;
}

function readSortedIntArray(count, descending = false) {
  const arr = readIntArray(count);
  return arr.sort((a, b) => descending ? b - a : a - b);
}

function readMatrix(height, width, mapToNum = true) {
  const matrix = [];
  for (let i = 0; i < height; i++) {
    const row = tokenBuffer.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    matrix.push(mapToNum ? row.map(val => +val) : row);
  }
  return matrix;
}

function createMultiDimArray(initialValue) {
  const args = arguments;
  let argCount = args.length;
  let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

const outputBuffer = [];
function appendToOutput(content) { outputBuffer.push(content); }

const finalResult = solveProblem();
if (finalResult !== undefined) {
  console.log(String(finalResult));
}
if (outputBuffer.length) {
  console.log(outputBuffer.join("\n"));
}

function solveProblem() {
  const inputNum = readInt();
  if (inputNum === 1) {
    return 1;
  }

  let oddFactor = inputNum;
  let powerOfTwoFactor = 2;

  while (oddFactor % 2 === 0) {
    oddFactor /= 2;
    powerOfTwoFactor *= 2;
  }

  const doubleInput = inputNum * 2;
  let minResult = doubleInput - 1;

  const loopLimit = Math.sqrt(oddFactor);
  for (let divisorCandidate = 1; divisorCandidate <= loopLimit; divisorCandidate += 2) {
    if (oddFactor % divisorCandidate !== 0) {
      continue;
    }

    const complementaryFactor = oddFactor / divisorCandidate;
    const res1 = calculateMinProduct(complementaryFactor, divisorCandidate * powerOfTwoFactor);
    const res2 = calculateMinProduct(complementaryFactor * powerOfTwoFactor, divisorCandidate);

    minResult = Math.min(minResult, res1, res2);
  }
  return minResult;
}

const LARGE_NUMBER_THRESHOLD = 9e15;

function calculateMinProduct(valU, valV) {
  const [coeffA, coeffB, commonDivisor] = extendedEuclideanAlgorithm(valU, valV);

  if (commonDivisor > 1) {
    return LARGE_NUMBER_THRESHOLD;
  }

  let currentMinProduct = LARGE_NUMBER_THRESHOLD;
  if (coeffA < 0) {
    currentMinProduct = -coeffA * valU;
  } else if (coeffB < 0) {
    currentMinProduct = -coeffB * valV;
  }
  return currentMinProduct;
}

function extendedEuclideanAlgorithm(initialX, initialY) {
  let coeffA0 = 1n, coeffA1 = 0n;
  let coeffB0 = 0n, coeffB1 = 1n;

  let currentX = BigInt(initialX);
  let currentY = BigInt(initialY);

  while (currentY !== 0n) {
    const quotient = currentX / currentY;
    const remainder = currentX % currentY;

    const nextCoeffA = coeffA0 - quotient * coeffA1;
    const nextCoeffB = coeffB0 - quotient * coeffB1;

    const tempX = currentY;
    const tempY = remainder;
    currentX = tempX;
    currentY = tempY;

    const tempA0 = coeffA1;
    const tempA1 = nextCoeffA;
    coeffA0 = tempA0;
    coeffA1 = tempA1;

    const tempB0 = coeffB1;
    const tempB1 = nextCoeffB;
    coeffB0 = tempB0;
    coeffB1 = tempB1;
  }
  return [Number(coeffA0), Number(coeffB0), currentX];
}
