"use strict";

// Standard input processing setup
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = fileContent.split(/ |\n/);
let tokenIndex = 0;

// Helper functions for parsing input
function getNextInt() {
  return +tokenStream[tokenIndex++];
}

function getNextString() {
  return tokenStream[tokenIndex++];
}

function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function getNValues(count, asStrings) {
  const values = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return asStrings ? values : values.map(val => +val);
}

function getMatrix(height, width, asStrings) {
  const resultMatrix = [];
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const row = tokenStream.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    resultMatrix.push(asStrings ? row : row.map(val => +val));
  }
  return resultMatrix;
}

// Function to create multi-dimensional arrays (not used in this specific problem, but part of original utilities)
function createMultiDimArray(initialValue) {
  const args = arguments;
  let argLength = args.length;
  let arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Mathematical utility: Greatest Common Divisor for BigInts
function greatestCommonDivisor(numA, numB) {
  return numB ? greatestCommonDivisor(numB, numA % numB) : numA;
}

// Modulo constant for calculations
const moduloConstant = 1000000007; // 1e9 + 7

// Modulo multiplication function
function multiplyModulo() {
  const factors = arguments;
  let currentProduct = factors[0];
  for (let factorIndex = factors.length; --factorIndex;) {
    // This specific multiplication method is for optimizing large numbers in JS,
    // effectively splitting into two 16-bit parts to avoid overflow before modulo.
    currentProduct = ((currentProduct >> 16) * factors[factorIndex] % moduloConstant * 65536 + (currentProduct & 65535) * factors[factorIndex]) % moduloConstant;
  }
  return currentProduct;
}

// Modulo power function (binary exponentiation)
function powerModulo(baseVal, exponentVal) {
  let resultVal = 1;
  while (exponentVal) {
    if (exponentVal & 1) { // If exponentVal is odd
      resultVal = multiplyModulo(baseVal, resultVal);
    }
    baseVal = multiplyModulo(baseVal, baseVal); // Square the base
    exponentVal >>= 1; // Divide exponentVal by 2
  }
  return resultVal;
}

// Normalize a number to be within [0, moduloConstant-1]
function normalizeModulo(valueToNormalize) {
  return (valueToNormalize % moduloConstant + moduloConstant) % moduloConstant;
}

// Execute the main problem-solving logic
const programOutput = solveProblem();

// Output the result if it's not undefined
if (programOutput !== undefined) {
  console.log(programOutput);
}

// Main function containing the problem's algorithm
function solveProblem() {
  const inputCount = getNextInt(); // Number of pairs to process

  let zeroA_count = 0; // Count of pairs where 'a' is zero
  let zeroB_count = 0; // Count of pairs where 'b' is zero
  let bothZero_count = 0; // Count of pairs where both 'a' and 'b' are zero

  // Map to store unique (a,b) pairs after normalization and their counts (multiplied by 2)
  const coefficientMap = {};
  // List to store unique (a,b) pairs encountered, for later iteration
  const uniquePairsList = [];

  // Process each input pair
  for (let loopIndex = 0; loopIndex < inputCount; loopIndex++) {
    let coeffA = getNextBigInt();
    let coeffB = getNextBigInt();

    // Handle special cases: (0,0), (0,b), (a,0)
    if (coeffA === BigInt(0) && coeffB === BigInt(0)) {
      bothZero_count++;
      continue;
    }
    if (coeffA === BigInt(0)) {
      zeroA_count++;
      continue;
    }
    if (coeffB === BigInt(0)) {
      zeroB_count++;
      continue;
    }

    // Normalize (a,b) by dividing by their GCD
    const commonDivisor = greatestCommonDivisor(coeffA, coeffB);
    coeffA /= commonDivisor;
    coeffB /= commonDivisor;

    // Ensure 'a' is positive for consistent mapping (if 'a' is negative, flip signs of both)
    if (coeffA < BigInt(0)) {
      coeffA = -coeffA;
      coeffB = -coeffB;
    }

    // Update the map with the normalized pair
    if (coefficientMap[coeffA]) {
      if (coefficientMap[coeffA][coeffB]) {
        // If pair already exists, double its count (modulo arithmetic)
        coefficientMap[coeffA][coeffB] *= 2;
        if (coefficientMap[coeffA][coeffB] >= moduloConstant) {
          coefficientMap[coeffA][coeffB] -= moduloConstant;
        }
      } else {
        // If 'a' exists but 'b' doesn't, add new 'b' with count 2
        coefficientMap[coeffA][coeffB] = 2;
        uniquePairsList.push(coeffA, coeffB); // Add to list for iteration
      }
    } else {
      // If 'a' doesn't exist, create new entry and add 'b' with count 2
      coefficientMap[coeffA] = {};
      coefficientMap[coeffA][coeffB] = 2;
      uniquePairsList.push(coeffA, coeffB); // Add to list for iteration
    }
  }

  // Calculate initial answer based on zero counts
  // (2^zeroA_count + 2^zeroB_count - 1) represents combinations involving only zero-A or zero-B pairs
  let finalResult = powerModulo(2, zeroA_count) + powerModulo(2, zeroB_count) - 1;

  // Iterate through unique normalized (a,b) pairs
  for (let pairIndex = 0; pairIndex < uniquePairsList.length; pairIndex += 2) {
    const currentA = uniquePairsList[pairIndex];
    const currentB = uniquePairsList[pairIndex + 1];

    let tempSum = 0; // Temporary sum for current pair's contribution

    // Check for the "opposite" pair (-b, a) or (b, -a) depending on currentB's sign
    if (currentB < BigInt(0)) {
      // If currentB is negative, we are looking for (-currentB, currentA)
      // If this "opposite" pair exists, it means it was already processed as (currentA, currentB)
      // because we normalize 'a' to be positive. So, we skip to avoid double counting.
      if (coefficientMap[-currentB] && coefficientMap[-currentB][currentA]) {
        continue;
      }
    } else {
      // If currentB is positive, we are looking for (currentB, -currentA)
      // If this "opposite" pair exists, add its count (minus 1, as per problem logic)
      if (coefficientMap[currentB] && coefficientMap[currentB][-currentA]) {
        tempSum = coefficientMap[currentB][-currentA] - 1;
      }
    }

    // Add the count of the current pair (currentA, currentB)
    tempSum += coefficientMap[currentA][currentB];

    // Multiply the running finalResult by the current pair's contribution
    // The `mod <= tempSum ? tempSum - mod : tempSum` handles cases where tempSum might exceed mod
    finalResult = multiplyModulo(finalResult, moduloConstant <= tempSum ? tempSum - moduloConstant : tempSum);
  }

  // Final adjustment: subtract 1 (for the empty set) and add bothZero_count
  return normalizeModulo(finalResult - 1 + bothZero_count);
}
