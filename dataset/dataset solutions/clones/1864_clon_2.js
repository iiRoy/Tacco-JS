"use strict";

var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

var tokenStream = rawData.split(/ |\n/),
  tokenIndex = 0;

function getNextInt() {
  return +tokenStream[tokenIndex++];
}

function getNextString() {
  return tokenStream[tokenIndex++];
}

function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function getNextArray(numElements, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements));
  } else {
    return tokenStream.slice(tokenIndex, (tokenIndex += numElements)).map((val) => +val);
  }
}

function getNextMatrix(numRows, numCols, asStrings) {
  var resultMatrix = [],
    rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < numRows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += numCols)));
    }
  } else {
    for (; rowIndex < numRows; rowIndex++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, (tokenIndex += numCols)).map((val) => +val));
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    evalString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argCount) {
    evalString = "Array(args[" + argCount + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

function greatestCommonDivisor(num1, num2) {
  return num2 ? greatestCommonDivisor(num2, num1 % num2) : num1;
}

var primeModulus = 1000000007;

function multiplyMod() {
  var factors = arguments,
    currentProduct = factors[0],
    factorIndex = factors.length;
  while (--factorIndex) {
    currentProduct =
      ((currentProduct >> 16) * factors[factorIndex] % primeModulus * 65536 +
        (currentProduct & 65535) * factors[factorIndex]) %
      primeModulus;
  }
  return currentProduct;
}

var factorialValues = [],
  invFactorialValues = [],
  modularInverses = [],
  powersOfTwo = [];

function precomputeFactorials(limit) {
  factorialValues.length = limit + 1;
  factorialValues[0] = factorialValues[1] = 1;
  for (var k = 2; k <= limit; ) {
    factorialValues[k] = multiplyMod(factorialValues[k - 1], k++);
  }
  invFactorialValues.length = limit + 1;
  invFactorialValues[0] = invFactorialValues[1] = 1;
  invFactorialValues[limit] = modularInverse(factorialValues[limit]);
  for (k = limit; k > 2; ) {
    invFactorialValues[k - 1] = multiplyMod(invFactorialValues[k], k--);
  }
  // The following arrays were commented out in the original code.
  // modularInverses.length = limit + 1;
  // modularInverses[0] = modularInverses[1] = 1;
  // for (k = 2; k <= limit; ) {
  //   modularInverses[k] = multiplyMod(factorialValues[k - 1], invFactorialValues[k++]);
  // }
  // powersOfTwo.length = limit + 1;
  // powersOfTwo[0] = 1;
  // for (k = 1; k <= limit; k++) {
  //   powersOfTwo[k] = (powersOfTwo[k - 1] * 2) % primeModulus;
  // }
}

function modularInverse(value) {
  var currentMod = primeModulus,
    u_val = 0,
    v_val = 1,
    temp_val;
  while (value) {
    temp_val = currentMod / value | 0;
    currentMod -= temp_val * value;
    u_val -= temp_val * v_val;
    temp_val = currentMod;
    currentMod = value;
    value = temp_val;
    temp_val = u_val;
    u_val = v_val;
    v_val = temp_val;
  }
  u_val %= primeModulus;
  return u_val < 0 ? u_val + primeModulus : u_val;
}

function modularExponentiation(base, exponent) {
  var result = 1;
  while (exponent > 0) {
    if (exponent & 1) {
      result = multiplyMod(base, result);
    }
    base = multiplyMod(base, base);
    exponent >>= 1;
  }
  return result;
}

function combinationsMod(n, r) {
  return multiplyMod(factorialValues[n], invFactorialValues[r], invFactorialValues[n - r]);
}

function permutationsMod(n, r) {
  return multiplyMod(factorialValues[n], invFactorialValues[r]);
}

function normalizeMod(value) {
  return (value % primeModulus + primeModulus) % primeModulus;
}

var programOutput = solveProblem();
if (programOutput !== undefined) {
  console.log(programOutput);
}

function solveProblem() {
  var countElements = getNextInt();
  var zeroA_count = 0,
    zeroB_count = 0;
  var pairFrequencyMap = {};

  for (var idx = 0; idx < countElements; idx++) {
    var firstVal = getNextBigInt(),
      secondVal = getNextBigInt();

    if (firstVal === 0n && secondVal === 0n) {
      continue;
    }
    if (firstVal === 0n) {
      zeroA_count++;
      continue;
    }
    if (secondVal === 0n) {
      zeroB_count++;
      continue;
    }

    var commonDivisor = greatestCommonDivisor(firstVal, secondVal);
    firstVal /= commonDivisor;
    secondVal /= commonDivisor;

    if (firstVal < 0n) {
      firstVal = -firstVal;
      secondVal = -secondVal;
    }

    if (pairFrequencyMap[firstVal]) {
      if (pairFrequencyMap[firstVal][secondVal]) {
        pairFrequencyMap[firstVal][secondVal]++;
      } else {
        pairFrequencyMap[firstVal][secondVal] = 1;
      }
    } else {
      pairFrequencyMap[firstVal] = {};
      pairFrequencyMap[firstVal][secondVal] = 1;
    }
  }

  var finalResult = modularExponentiation(2, zeroA_count) + modularExponentiation(2, zeroB_count) - 1;

  for (var firstKey in pairFrequencyMap) {
    for (var secondKey in pairFrequencyMap[firstKey]) {
      var tempSum = 0;
      if (secondKey < 0) {
        if (pairFrequencyMap[secondKey.slice(1)] && pairFrequencyMap[secondKey.slice(1)][firstKey]) {
          continue;
        }
      } else {
        if (pairFrequencyMap[secondKey] && pairFrequencyMap[secondKey]["-" + firstKey]) {
          tempSum = modularExponentiation(2, pairFrequencyMap[secondKey]["-" + firstKey]) - 1;
        }
      }
      tempSum += modularExponentiation(2, pairFrequencyMap[firstKey][secondKey]);
      finalResult = multiplyMod(finalResult, tempSum % primeModulus);
    }
  }
  return normalizeMod(finalResult - 1);
}
