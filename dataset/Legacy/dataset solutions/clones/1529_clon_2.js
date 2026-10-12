"use strict";
// This script processes input data from standard input to compute a specific mathematical expression modulo a large prime number.

// Read all input from the standard input stream.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters.
var tokenArray = rawData.split(/ |\n/),
  tokenIndex = 0; // Initialize an index to keep track of the current token.

// Function to retrieve and parse the next token as a number.
function getNextNum() {
  return +tokenArray[tokenIndex++];
}

// Function to retrieve the next token as a string.
function getNextStr() {
  return tokenArray[tokenIndex++];
}

// Function to retrieve and parse the next token as a BigInt.
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

// Function to retrieve a specified number of tokens, optionally parsing them as numbers.
// 'count' is the number of tokens to retrieve. 'isString' determines if they remain strings or are converted to numbers.
function getNumsOrStrs(count, isString) {
  if (isString) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

// Function to retrieve a specified number of tokens, parse them as numbers, and sort them.
// 'count' is the number of tokens. 'descending' determines the sort order (true for descending, false for ascending).
function getSortedNums(count, descending) {
  if (descending) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val).sort((a, b) => b - a);
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val).sort((a, b) => a - b);
  }
}

// Function to retrieve a 2D matrix (array of arrays) from the tokens.
// 'height' is the number of rows, 'width' is the number of columns.
// 'isStringMatrix' determines if matrix elements remain strings or are converted to numbers.
function getMatrix(height, width, isStringMatrix) {
  var resultMatrix = [],
    rowCounter = 0;
  if (isStringMatrix) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)).map((val) => +val));
    }
  }
  return resultMatrix;
}

// Function to dynamically create a multi-dimensional array initialized with a given value.
// The dimensions are passed as subsequent arguments after the initial value.
function createMultiDimArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    // Start building the array creation expression from the innermost dimension.
    expression = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
  // Wrap the expression for each outer dimension.
  while (--argCount) {
    expression = "Array(args[" + argCount + "]).fill().map(x=>" + expression + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(expression);
}

// An array to buffer output lines before printing them to console.
var outputBuffer = [];

// Function to add a string to the output buffer.
function addToOutput(content) {
  outputBuffer.push(content);
}

// Define the prime modulus for all modular arithmetic operations.
var primeModulus = 1000000007; // This is 10^9 + 7

// Function for modular multiplication of an arbitrary number of arguments.
// It uses a specific optimization for multiplication modulo a prime.
function multiplyMod() {
  for (var operands = arguments, product = operands[0], i = operands.length; --i;) {
    // This calculation is equivalent to (product * operands[i]) % primeModulus
    // It splits 'product' into two 16-bit parts to avoid potential overflow before the modulo operation,
    // assuming intermediate products might exceed standard 32-bit integer limits but fit within 53-bit safe integers.
    product = ((product >>> 16) * operands[i] % primeModulus * 65536 + (product & 65535) * operands[i]) % primeModulus;
  }
  return product;
}

// Caches for precomputed values used in modular arithmetic.
var factorialCache = [], // Stores factorials (n!)
  invFactorialCache = [], // Stores inverse factorials ((n!)^-1 mod primeModulus)
  inverseCache = [], // (Commented out in original, so remains commented)
  powerOfTwoCache = []; // (Commented out in original, so remains commented)

// Function to precompute factorials and their modular inverses up to a given limit.
function setupFactorials(limit) {
  factorialCache.length = limit + 1;
  factorialCache[0] = factorialCache[1] = 1;
  // Compute factorials iteratively.
  for (var i = 2; i <= limit;) {
    factorialCache[i] = multiplyMod(factorialCache[i - 1], i++);
  }

  invFactorialCache.length = limit + 1;
  invFactorialCache[0] = invFactorialCache[1] = 1;
  // Compute the inverse factorial of the largest number first using modularInverse.
  invFactorialCache[limit] = modularInverse(factorialCache[limit]);
  // Compute other inverse factorials iteratively downwards.
  for (i = limit; 2 < i;) {
    invFactorialCache[i - 1] = multiplyMod(invFactorialCache[i], i--);
  }

  // The following sections were commented out in the original code and are kept commented here.
  // inverseCache.length = limit + 1;
  // inverseCache[0] = inverseCache[1] = 1;
  // for (i = 2; i <= limit;) {
  //   inverseCache[i] = multiplyMod(factorialCache[i - 1], invFactorialCache[i++]);
  // }
  // powerOfTwoCache.length = limit + 1;
  // powerOfTwoCache[0] = 1;
  // for (i = 1; i <= limit; i++) {
  //   powerOfTwoCache[i] = powerOfTwoCache[i - 1] * 2 % primeModulus;
  // }
}

// Function to compute the modular multiplicative inverse of 'valueB' modulo 'primeModulus'.
// Uses the extended Euclidean algorithm.
function modularInverse(valueB) {
  for (var valueA = primeModulus, u = 0, v = 1, temp; valueB; v = temp) {
    temp = Math.floor(valueA / valueB); // Integer division
    valueA -= temp * valueB;
    u -= temp * v;
    temp = valueA;
    valueA = valueB;
    valueB = temp;
    temp = u;
    u = v;
  }
  u %= primeModulus;
  return u < 0 ? u + primeModulus : u; // Ensure the result is positive.
}

// Function to compute modular exponentiation (base^exponent % primeModulus) using binary exponentiation (exponentiation by squaring).
function modularPower(base, exponent) {
  for (var result = 1; exponent; base = multiplyMod(base, base), exponent >>= 1) {
    if (exponent & 1) { // If the current bit of exponent is 1
      result = multiplyMod(base, result);
    }
  }
  return result;
}

// Function to compute "n choose r" (combinations) modulo primeModulus.
function nCrMod(nVal, rVal) {
  return multiplyMod(factorialCache[nVal], invFactorialCache[rVal], invFactorialCache[nVal - rVal]);
}

// Function to compute "n permute r" (permutations) modulo primeModulus.
function nPrMod(nVal, rVal) {
  return multiplyMod(factorialCache[nVal], invFactorialCache[nVal - rVal]);
}

// Function to normalize a number to be within the [0, primeModulus-1] range.
function normalizeMod(num) {
  return (num % primeModulus + primeModulus) % primeModulus;
}


// Execute the main problem-solving logic.
var finalResult = calculateSolution();

// If the main function returned a value, print it to the console.
if (finalResult !== undefined) {
  console.log(String(finalResult));
}

// If there are any buffered output lines, print them to the console, each on a new line.
if (outputBuffer.length) {
  console.log(outputBuffer.join("\n"));
}

// The core logic for the specific problem.
function calculateSolution() {
  var inputVal = getNextNum(); // Read the single integer input 'n'.
  var computedAnswer = modularPower(10, inputVal); // Calculate 10^n mod primeModulus.
  computedAnswer -= modularPower(9, inputVal); // Subtract 9^n mod primeModulus.
  computedAnswer -= modularPower(9, inputVal); // Subtract 9^n mod primeModulus again.
  computedAnswer += modularPower(8, inputVal); // Add 8^n mod primeModulus.
  // Normalize the final result to ensure it's positive and within the modulus range.
  return normalizeMod(computedAnswer);
}
