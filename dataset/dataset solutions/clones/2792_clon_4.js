'use strict';
(function(inputSource){
  // Process raw input string into numerical parameters
  const processedInput = inputSource.trim().split(/\s+/).map(val => parseInt(val, 10));
  const problemN = processedInput[0];
  const problemK = processedInput[1];
  const derivedL = problemN - problemK + 1;
  const modulus = (1e9 + 7);
  const bigModulus = BigInt(modulus); // Convert modulus to BigInt for precise modular arithmetic

  // Helper function for modular addition
  const addModulo = (val1, val2) => (val1 + val2) % modulus;

  // Helper function for modular multiplication, using BigInt to prevent overflow
  // when intermediate products exceed Number.MAX_SAFE_INTEGER.
  const multiplyModulo = (val1, val2) => {
    const bigVal1 = BigInt(val1);
    const bigVal2 = BigInt(val2);
    return Number((bigVal1 * bigVal2) % bigModulus);
  };

  // Helper function for modular exponentiation (base^exponent % modulus)
  // Implements exponentiation by squaring.
  const powerModulo = (base, exponent) => {
    let result = 1;
    let currentBase = base;
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = multiplyModulo(result, currentBase);
      }
      currentBase = multiplyModulo(currentBase, currentBase);
      exponent = Math.floor(exponent / 2);
    }
    return result;
  };

  // Helper function for modular multiplicative inverse using Fermat's Little Theorem.
  // Requires modulus to be a prime number (1e9 + 7 is prime).
  const inverseModulo = (num) => powerModulo(num, modulus - 2);

  // Precompute factorials and inverse factorials up to problemN.
  // This is a different strategy for combinations compared to Pascal's triangle DP.
  const factorialCache = new Array(problemN + 1);
  const invFactorialCache = new Array(problemN + 1);

  factorialCache[0] = 1;
  invFactorialCache[0] = 1;

  // Calculate factorials
  for (let i = 1; i <= problemN; i++) {
    factorialCache[i] = multiplyModulo(factorialCache[i - 1], i);
  }

  // Calculate inverse factorial for the largest number, then work backwards
  invFactorialCache[problemN] = inverseModulo(factorialCache[problemN]);
  for (let i = problemN - 1; i >= 1; i--) {
    invFactorialCache[i] = multiplyModulo(invFactorialCache[i + 1], i + 1);
  }

  // Function to calculate combinations C(n, k) using precomputed factorials and inverse factorials.
  // C(n, k) = n! * (k!)^(-1) * ((n-k)!)^(-1) (all modulo M)
  const calculateCombinations = (n, k) => {
    if (k < 0 || k > n) {
      return 0;
    }
    return multiplyModulo(factorialCache[n], multiplyModulo(invFactorialCache[k], invFactorialCache[n - k]));
  };

  // Generate the final results using functional array methods instead of a traditional for loop.
  const finalResults = Array.from({ length: problemK }, (_, index) => {
    const currentIteration = index + 1;
    const term1 = calculateCombinations(derivedL, currentIteration);
    const term2 = calculateCombinations(problemK - 1, currentIteration - 1);
    return multiplyModulo(term1, term2);
  });

  console.log(finalResults.join('\n'));
})(require('fs').readFileSync('/dev/stdin','utf8'));
