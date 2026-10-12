"use strict";

// Read raw input from standard input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens and initialize token index
var tokenArray = rawData.split(/ |\n/),
  tokenIndex = 0;

// Helper function to get the next number token
function getNextNum() {
  return +tokenArray[tokenIndex++];
}

// Helper function to get the next string token
function getNextStr() {
  return tokenArray[tokenIndex++];
}

// Helper function to get the next BigInt token
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

// Helper function to get an array of numbers or strings
// (Not used in main logic, but renamed for consistency)
function getNumsOrStrs(count, asStrings) {
  return asStrings ?
    tokenArray.slice(tokenIndex, (tokenIndex += count)) :
    tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
}

// Helper function to get a 2D matrix of numbers or strings
// (Not used in main logic, but renamed for consistency)
function getMatrix(height, width, asStrings) {
  var resultMatrix = [],
    rowIdx = 0;
  if (asStrings) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(
        tokenArray.slice(tokenIndex, (tokenIndex += width)).map((val) => +val)
      );
    }
  }
  return resultMatrix;
}

// Helper function to create multi-dimensional arrays
// (Not used in main logic, but renamed for consistency)
function createMultiDimArray(initialValue) {
  var dimArgs = arguments,
    argLength = dimArgs.length,
    arrayCreationString =
    "Array(dimArgs[" +
    --argLength +
    "]).fill().map(x=>{return " +
    initialValue +
    ";})";
  while (--argLength) {
    arrayCreationString =
      "Array(dimArgs[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Function to calculate the greatest common divisor of two BigInts
function greatestCommonDivisor(valA, valB) {
  return valB ? greatestCommonDivisor(valB, valA % valB) : valA;
}

// Define a prime modulus for modular arithmetic operations
var primeModulus = 1000000007; // 1e9 + 7

// Modular multiplication function for multiple arguments
function multiplyMod() {
  for (
    var factors = arguments, productResult = factors[0], factorIndex = factors.length; --factorIndex;

  ) {
    productResult =
      ((productResult >> 16) * factors[factorIndex] % primeModulus * 65536 +
        (productResult & 65535) * factors[factorIndex]) %
      primeModulus;
  }
  return productResult;
}

// Arrays for precomputed factorials, inverse factorials, modular inverses, and powers of two
var factorialValues = [],
  invFactorialValues = [],
  modularInverses = [], // Not used in main logic
  powersOfTwo = []; // Not used in main logic

// Function to precompute factorials and inverse factorials up to a limit
function precomputeFactorials(limitVal) {
  factorialValues.length = limitVal + 1;
  factorialValues[0] = factorialValues[1] = 1;
  for (var loopCounter = 2; loopCounter <= limitVal;) {
    factorialValues[loopCounter] = multiplyMod(
      factorialValues[loopCounter - 1],
      loopCounter++
    );
  }

  invFactorialValues.length = limitVal + 1;
  invFactorialValues[0] = invFactorialValues[1] = 1;
  invFactorialValues[limitVal] = modularInverse(factorialValues[limitVal]);
  for (loopCounter = limitVal; 2 < loopCounter;) {
    invFactorialValues[loopCounter - 1] = multiplyMod(
      invFactorialValues[loopCounter],
      loopCounter--
    );
  }
  // The following lines are commented out in the original, so they remain commented.
  // modularInverses.length = limitVal + 1;
  // modularInverses[0] = modularInverses[1] = 1;
  // for (loopCounter = 2; loopCounter <= limitVal; ) {
  //   modularInverses[loopCounter] = multiplyMod(
  //     factorialValues[loopCounter - 1],
  //     invFactorialValues[loopCounter++]
  //   );
  // }
  // powersOfTwo.length = limitVal + 1;
  // powersOfTwo[0] = 1;
  // for (loopCounter = 1; loopCounter <= limitVal; loopCounter++) {
  //   powersOfTwo[loopCounter] = powersOfTwo[loopCounter - 1] * 2 % primeModulus;
  // }
}

// Function to calculate the modular inverse using extended Euclidean algorithm
function modularInverse(valB) {
  for (
    var modVal = primeModulus, x0 = 0, x1 = 1, tempVar; valB; x1 = tempVar
  ) {
    tempVar = modVal / valB | 0;
    modVal -= tempVar * valB;
    x0 -= tempVar * x1;
    tempVar = modVal;
    modVal = valB;
    valB = tempVar;
    tempVar = x0;
    x0 = x1;
  }
  x0 %= primeModulus;
  return x0 < 0 ? x0 + primeModulus : x0;
}

// Function to calculate modular exponentiation (a^n % primeModulus)
function powerMod(baseVal, exponentVal) {
  for (var resultPower = 1; exponentVal; baseVal = multiplyMod(baseVal, baseVal), exponentVal >>= 1) {
    if (exponentVal & 1) {
      resultPower = multiplyMod(baseVal, resultPower);
    }
  }
  return resultPower;
}

// Function to calculate nCr (n choose r) modulo primeModulus
// (Not used in main logic, but renamed for consistency)
function nCrMod(nVal, rVal) {
  return multiplyMod(
    factorialValues[nVal],
    invFactorialValues[rVal],
    invFactorialValues[nVal - rVal]
  );
}

// Function to calculate nPr (n permute r) modulo primeModulus
// (Not used in main logic, but renamed for consistency)
function nPrMod(nVal, rVal) {
  return multiplyMod(factorialValues[nVal], invFactorialValues[rVal]);
}

// Function to normalize a number to be within [0, primeModulus-1]
function normalizeMod(valueToNormalize) {
  return (valueToNormalize % primeModulus + primeModulus) % primeModulus;
}

// Execute the main problem-solving logic
var resultValue = solveProblem();

// Output the result if it's not undefined
if (resultValue !== undefined) {
  console.log(resultValue);
}

// Main function containing the problem's core logic
function solveProblem() {
  var numPairs = getNextNum();
  var zeroA_count = 0,
    zeroB_count = 0,
    bothZero_count = 0;
  var pairCounts = {},
    uniqueA_values = [];

  // Process each pair (a, b)
  for (var pairIndex = 0; pairIndex < numPairs; pairIndex++) {
    var currentA = getNextBigInt(),
      currentB = getNextBigInt();

    // Handle special cases: (0,0), (0,b), (a,0)
    if (currentA === BigInt(0) && currentB === BigInt(0)) {
      bothZero_count++;
      continue;
    }
    if (currentA === BigInt(0)) {
      zeroA_count++;
      continue;
    }
    if (currentB === BigInt(0)) {
      zeroB_count++;
      continue;
    }

    // Normalize (a,b) by dividing by their GCD
    var commonDivisor = greatestCommonDivisor(currentA, currentB);
    currentA /= commonDivisor;
    currentB /= commonDivisor;

    // Ensure 'a' is positive for consistent mapping
    if (currentA < BigInt(0)) {
      currentA = -currentA;
      currentB = -currentB;
    }

    // Store counts of normalized pairs
    if (pairCounts[currentA]) {
      if (pairCounts[currentA][currentB]) {
        pairCounts[currentA][currentB]++;
      } else {
        pairCounts[currentA][currentB] = 1;
      }
    } else {
      pairCounts[currentA] = {};
      pairCounts[currentA][currentB] = 1;
      uniqueA_values.push(currentA);
    }
  }

  // Calculate initial answer based on zero counts
  var finalAnswer = powerMod(2, zeroA_count) + powerMod(2, zeroB_count) - 1;

  // Iterate through unique 'a' values to process pairs
  for (var arrIdx = 0; arrIdx < uniqueA_values.length; arrIdx++) {
    var currentUniqueA = uniqueA_values[arrIdx];

    // Iterate through 'b' values associated with currentUniqueA
    for (var b_str in pairCounts[currentUniqueA]) {
      var tempSum = 0;
      // If b is negative, check for its positive counterpart
      if (b_str < 0) {
        // If the positive counterpart of b and currentUniqueA already processed, skip
        if (pairCounts[b_str.slice(1)] && pairCounts[b_str.slice(1)][currentUniqueA]) {
          continue;
        }
      } else {
        // If b is positive, check for its negative counterpart
        if (pairCounts[b_str] && pairCounts[b_str]["-" + currentUniqueA]) {
          tempSum = powerMod(2, pairCounts[b_str]["-" + currentUniqueA]) - 1;
        }
      }
      // Add the contribution of the current pair
      tempSum += powerMod(2, pairCounts[currentUniqueA][b_str]);
      // Multiply into the final answer, ensuring modulo arithmetic
      finalAnswer = multiplyMod(finalAnswer, tempSum % primeModulus);
    }
  }

  // Normalize the final answer and add the count of (0,0) pairs
  return normalizeMod(finalAnswer - 1 + bothZero_count);
}
