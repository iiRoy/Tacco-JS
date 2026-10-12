function ProcessInput(inputStr) {
  // Parse the input string into an array of numbers
  inputStr = inputStr.split(" ").map(val => +val);

  // Extract problem parameters
  var numItems = inputStr[0]; // Represents 'n'
  var costA = inputStr[1];    // Represents 'a'
  var costB = inputStr[2];    // Represents 'b'
  var totalBudget = inputStr[3]; // Represents 'k'

  var finalResult = 0; // Initialize the answer accumulator

  // Iterate through possible counts for item 'a'
  for (var idxA = 0; idxA <= numItems; idxA++) {
    // Calculate remaining budget after purchasing 'idxA' items of type 'a'
    var remainingBudget = totalBudget - idxA * costA;

    // If remaining budget is negative, we can't buy any more 'a' items
    if (remainingBudget < 0) {
      break;
    }

    // Check if remaining budget can be perfectly spent on 'b' items
    // and if the count of 'b' items does not exceed 'numItems'
    if (remainingBudget % costB === 0 && remainingBudget / costB <= numItems) {
      // Calculate combinations for 'a' items and 'b' items
      // and multiply them, then add to the final result
      finalResult += combinationsModulo(numItems, idxA) * combinationsModulo(numItems, remainingBudget / costB);
      finalResult %= mod; // Apply modulo operation
    }
  }

  // Output the final calculated result
  console.log(finalResult);
}

/**
 * Multiplies an arbitrary number of arguments and applies modulo.
 * This function uses a specific bitwise optimization for multiplication.
 * @param {...number} args - Numbers to multiply.
 * @returns {number} The product modulo 'mod'.
 */
function multiplyAndModulo() {
  var currentProduct = arguments[0]; // Start with the first argument
  for (var argIndex = 1; argIndex < arguments.length; argIndex++) {
    // Optimized multiplication to prevent overflow before modulo
    currentProduct = (currentProduct >>> 16) * arguments[argIndex] % mod * 0x10000 + (currentProduct & 0xFFFF) * arguments[argIndex];
    currentProduct %= mod; // Apply modulo
  }
  return currentProduct;
}

/**
 * Calculates (baseVal ^ exponentVal) % mod using binary exponentiation.
 * @param {number} baseVal - The base.
 * @param {number} exponentVal - The exponent.
 * @returns {number} (baseVal ^ exponentVal) % mod.
 */
function powerModulo(baseVal, exponentVal) {
  var resultVal = 1; // Initialize result to 1
  while (exponentVal) {
    if (exponentVal & 1) { // If the last bit of exponentVal is 1
      resultVal = multiplyAndModulo(baseVal, resultVal); // Multiply result by base
    }
    baseVal = multiplyAndModulo(baseVal, baseVal); // Square the base
    exponentVal >>>= 1; // Right shift exponentVal by 1 (divide by 2)
  }
  return resultVal;
}

// Global constant for modulo operation
var mod = 998244353;

// Arrays to store precomputed factorials and inverse factorials
var factorialValues = [1, 1];
var inverseFactorialValues = [1, 1];

/**
 * Computes n! modulo 'mod' and stores it in factorialValues array.
 * @param {number} limitNum - The number up to which factorials should be computed.
 * @returns {number} factorialValues[limitNum].
 */
function calculateFactorial(limitNum) {
  for (var currentNum = factorialValues.length; currentNum <= limitNum; currentNum++) {
    factorialValues[currentNum] = multiplyAndModulo(factorialValues[currentNum - 1], currentNum);
  }
  return factorialValues[limitNum];
}

/**
 * Computes the modular multiplicative inverse of n! modulo 'mod' and stores it.
 * Uses Fermat's Little Theorem for inverse: a^(mod-2) % mod.
 * @param {number} targetNum - The number for which to compute the inverse factorial.
 */
function calculateInverseFactorial(targetNum) {
  // Ensure factorial for targetNum is computed
  if (!factorialValues[targetNum]) {
    calculateFactorial(targetNum);
  }
  // Compute inverse factorial for targetNum
  inverseFactorialValues[targetNum] = powerModulo(factorialValues[targetNum], mod - 2);

  // Compute inverse factorials for numbers less than targetNum using the relation:
  // (n-1)!^-1 = n!^-1 * n
  while (!inverseFactorialValues[targetNum - 1] && targetNum > 0) {
    inverseFactorialValues[targetNum - 1] = multiplyAndModulo(inverseFactorialValues[targetNum], targetNum);
    targetNum--;
  }
}

/**
 * Computes nCr (n choose r) modulo 'mod'.
 * nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
 * @param {number} totalN - Total number of items.
 * @param {number} chooseR - Number of items to choose.
 * @returns {number} nCr % mod.
 */
function combinationsModulo(totalN, chooseR) {
  // Handle invalid inputs for combinations
  if (chooseR < 0 || chooseR > totalN) {
    return 0;
  }
  // Ensure inverse factorials are precomputed up to totalN
  if (!inverseFactorialValues[totalN]) {
    calculateInverseFactorial(totalN);
  }
  // Calculate nCr using precomputed factorials and inverse factorials
  return multiplyAndModulo(factorialValues[totalN], inverseFactorialValues[chooseR], inverseFactorialValues[totalN - chooseR]);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
