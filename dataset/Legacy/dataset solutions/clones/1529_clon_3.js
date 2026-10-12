"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/);
var tokenIndex = 0;

function readNum() {
  return +tokenizedInput[tokenIndex++];
}

function readStr() {
  return tokenizedInput[tokenIndex++];
}

function readBigInt() {
  return BigInt(tokenizedInput[tokenIndex++]);
}

const mapToNumbers = (arr) => arr.map(val => +val);

function readNums(count, asNumbers) {
  const slice = tokenizedInput.slice(tokenIndex, tokenIndex += count);
  return asNumbers ? mapToNumbers(slice) : slice;
}

function readSortedNums(count, descending) {
  const numbers = mapToNumbers(tokenizedInput.slice(tokenIndex, tokenIndex += count));
  return descending ? numbers.sort((a, b) => b - a) : numbers.sort((a, b) => a - b);
}

function readMatrix(height, width, asStrings) {
  const matrixRows = [];
  for (let i = 0; i < height; i++) {
    const rowSlice = tokenizedInput.slice(tokenIndex, tokenIndex += width);
    matrixRows.push(asStrings ? rowSlice : mapToNumbers(rowSlice));
  }
  return matrixRows;
}

function createMultiDimArray(initialValue) {
  var args = arguments,
    len = args.length,
    resultExpr = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--len) resultExpr = "Array(args[" + len + "]).fill().map(x=>" + resultExpr + ")";
  return eval(resultExpr);
}

var outputBuffer = [];

function appendToOutput(content) {
  outputBuffer.push(content);
}

var primeModulus = 1e9 + 7;

function modMultiply() {
  const factors = arguments;
  let currentProduct = factors[0];
  const modulus = primeModulus;

  for (let i = 1; i < factors.length; i++) {
    const nextFactor = factors[i];
    const highPart = (currentProduct >> 16);
    const lowPart = (currentProduct & 0xFFFF);

    let term1 = (highPart * nextFactor) % modulus;
    term1 = (term1 * 0x10000) % modulus;

    const term2 = (lowPart * nextFactor) % modulus;

    currentProduct = (term1 + term2) % modulus;
  }
  return currentProduct;
}

var factorials = [],
  invFactorials = [];

function precomputeFactorials(limit) {
  factorials.length = limit + 1;
  factorials[0] = factorials[1] = 1;
  for (let i = 2; i <= limit;) {
    factorials[i] = modMultiply(factorials[i - 1], i++);
  }

  invFactorials.length = limit + 1;
  invFactorials[0] = invFactorials[1] = 1;
  invFactorials[limit] = modInverse(factorials[limit]);
  for (let i = limit; 2 < i;) {
    invFactorials[i - 1] = modMultiply(invFactorials[i], i--);
  }
}

function modInverse(val) {
  let a = primeModulus,
    u = 0,
    v = 1,
    temp;
  while (val) {
    temp = a / val | 0;
    a -= temp * val;
    u -= temp * v;
    temp = a;
    a = val;
    val = temp;
    temp = u;
    u = v;
    v = temp;
  }
  u %= primeModulus;
  return u < 0 ? u + primeModulus : u;
}

function modPow(base, exponent) {
  let result = 1;
  let currentBase = base;
  while (exponent > 0) {
    if (exponent & 1) {
      result = modMultiply(currentBase, result);
    }
    currentBase = modMultiply(currentBase, currentBase);
    exponent >>= 1;
  }
  return result;
}

function nCrMod(n, r) {
  if (r < 0 || r > n) return 0;
  return modMultiply(factorials[n], invFactorials[r], invFactorials[n - r]);
}

function nPrMod(n, r) {
  if (r < 0 || r > n) return 0;
  return modMultiply(factorials[n], invFactorials[n - r]);
}

function normalizeMod(value) {
  return (value % primeModulus + primeModulus) % primeModulus;
}


var finalResult = calculateMain();

if (finalResult !== undefined) {
  console.log(String(finalResult));
}
if (outputBuffer.length > 0) {
  console.log(outputBuffer.join("\n"));
}

function calculateMain() {
  const inputN = readNum();

  const powerOfTen = modPow(10, inputN);
  const powerOfNine = modPow(9, inputN);
  const powerOfEight = modPow(8, inputN);

  const twoTimesPowerOfNine = modMultiply(2, powerOfNine);

  let currentAnswer = powerOfTen;
  currentAnswer = normalizeMod(currentAnswer - twoTimesPowerOfNine);
  currentAnswer = normalizeMod(currentAnswer + powerOfEight);

  return normalizeMod(currentAnswer);
}
