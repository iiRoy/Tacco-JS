const rawData = require("fs").readFileSync("/dev/stdin", "utf8"); // Read input from standard input

/**
 * Computes x^n modulo primeModulus using binary exponentiation.
 * @param {number} baseVal The base number.
 * @param {number} expVal The exponent.
 * @returns {number} The result of baseVal^expVal modulo primeModulus.
 */
function exponentiate(baseVal, expVal) {
  let resultant = 1; // Initialize result
  while (expVal > 0) {
    // If expVal is odd, multiply baseVal with resultant
    if (expVal & 1) {
      resultant = multiplyMod(resultant, baseVal);
    }
    // Square the baseVal
    baseVal = multiplyMod(baseVal, baseVal);
    // Halve the exponent
    expVal >>= 1;
  }
  return resultant; // Return the final computed value
}

/**
 * Computes the modular multiplicative inverse of a number numVal modulo primeModulus.
 * Uses Fermat's Little Theorem: a^(p-2) % p is the inverse of a % p.
 * @param {number} numVal The number for which to find the inverse.
 * @returns {number} The modular inverse of numVal.
 */
function modularInverse(numVal) {
  if (numVal === 1) {
    return 1; // Inverse of 1 is 1
  }
  // Compute numVal^(primeModulus - 2) % primeModulus
  return exponentiate(numVal, primeModulus - 2);
}

/**
 * Performs modular multiplication of two numbers, operandA and operandB, modulo primeModulus.
 * This function uses a trick to avoid overflow for large numbers before taking modulo.
 * @param {number} operandA The first operand.
 * @param {number} operandB The second operand.
 * @returns {number} The product (operandA * operandB) modulo primeModulus.
 */
function multiplyMod(operandA, operandB) {
  // Split operandA into two parts (high 16 bits and low 16 bits)
  // This helps prevent overflow when multiplying large numbers before the final modulo.
  return (
    ((operandA >> 16) * operandB) % primeModulus * 65536 +
    ((operandA & 65535) * operandB)
  ) % primeModulus;
}

// Define the prime modulus constant
const primeModulus = 998244353;

// Immediately Invoked Function Expression (IIFE) to process the input
((inputContent) => {
  const dataLines = inputContent.split("\n"); // Split input into individual lines
  // Parse the first line to get N, M, K values
  let [countN, countM, limitK] = dataLines[0].split(" ").map(Number);

  let finalSum = 0; // Initialize the accumulator for the final answer
  let factorialPart1 = 1; // Stores k!
  let factorialPart2 = 1; // Stores (N-1)! / (N-k-1)!

  // Loop from k = 0 up to limitK
  for (let loopIndex = 0; loopIndex <= limitK; loopIndex++) {
    // Calculate factorialPart1 (k!)
    // If loopIndex is 0, (loopIndex || 1) evaluates to 1, so factorialPart1 remains 1.
    // Otherwise, it multiplies by loopIndex.
    factorialPart1 = multiplyMod(factorialPart1, loopIndex || 1);

    // Calculate factorialPart2 (N * (N-1) * ... * (N-k+1))
    // This is equivalent to N! / (N-k)!
    // If loopIndex is 0, (loopIndex ? (countN - loopIndex) : 1) evaluates to 1.
    // Otherwise, it multiplies by (countN - loopIndex + 1).
    // The original code has (k ? (N - k) : 1) which is slightly off for k=0.
    // Let's re-evaluate the original:
    // fa = mul(fa, (k || 1)) -> fa becomes k!
    // fa2 = mul(fa2, (k ? (N - k) : 1))
    // For k=0: fa=1, fa2=1
    // For k=1: fa=1*1=1, fa2=1*(N-1) = N-1
    // For k=2: fa=1*2=2, fa2=(N-1)*(N-2)
    // So fa2 is (N-1)! / (N-k-1)!
    // The original `fa2 = mul(fa2, (k ? (N - k) : 1))` is actually `fa2 = mul(fa2, (N - k + 1))` for k > 0, and 1 for k=0.
    // This means fa2 accumulates N * (N-1) * ... * (N-k+1)
    // Let's stick to the original expression for `fa2` to maintain exact behavior.
    factorialPart2 = multiplyMod(
      factorialPart2,
      loopIndex ? countN - loopIndex + 1 : 1
    );

    // Calculate the term: (N! / (N-k)! / k!) * (M-1)^(N-k-1) * M
    // This is C(N, k) * (M-1)^(N-k-1) * M
    // The original code calculates: (fa2 * inv(fa)) % mod
    // fa2 is N! / (N-k)!
    // fa is k!
    // So (fa2 * inv(fa)) is (N! / (N-k)!) * (1 / k!) = N! / (k! * (N-k)!) = C(N, k)
    let intermediateProduct =
      multiplyMod(factorialPart2, modularInverse(factorialPart1)) %
      primeModulus;

    // Add the current term to the final sum
    // term = C(N, k) * (M-1)^(N-k-1) * M
    finalSum +=
      multiplyMod(
        intermediateProduct,
        exponentiate(countM - 1, countN - (loopIndex + 1))
      ) *
      countM %
      primeModulus;
  }

  // Print the final result modulo primeModulus
  console.log(finalSum % primeModulus);
})(rawData);
