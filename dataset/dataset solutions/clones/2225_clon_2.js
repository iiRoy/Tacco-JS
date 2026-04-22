console.log((inputData => {
  // This section parses the input data.
  // The first line contains N (countElements), the second line contains array A (numberArray).
  const [[countElements], numberArray] =
    inputData
      .trim()
      .split`\n`
      .map(lineStr => lineStr.split` `.map(valNum => 0 | valNum));

  // Define essential constants for the algorithm.
  const moduloVal = 1e9 + 7; // The modulus to be used for all arithmetic operations.
  const maxValue = Math.max(...numberArray); // Determines the upper bound for prime calculations.

  // A custom modular multiplication function to handle large numbers within JavaScript's limits.
  // It splits factorOne into 16-bit chunks to prevent overflow before applying the modulo.
  const multiplyMod = (factorOne, factorTwo) => (
    ((factorOne >> 16) * factorTwo % moduloVal * 65536) + ((factorOne & 65535) * factorTwo)
  ) % moduloVal;

  // Initialize a boolean array for the Sieve of Eratosthenes.
  // `isPrimeFlags[k]` is true if `k` is prime, false otherwise.
  // Note: The array size is fixed at 1e6+1, implying `maxValue` is expected to be within this range.
  const isPrimeFlags = Array(1e6 + 1).fill(true);
  // This map stores the maximum exponent found for each prime factor across all numbers in `numberArray`.
  const maxPrimeExponents = new Map();

  // Execute the Sieve of Eratosthenes and initialize `maxPrimeExponents` for relevant primes.
  for (let currentPrime = 2; currentPrime <= maxValue; currentPrime++) {
    if (!isPrimeFlags[currentPrime]) {
      // If `currentPrime` has already been marked as composite, skip to the next number.
      continue;
    }
    // Mark all multiples of `currentPrime` as composite.
    for (let compositeIndex = currentPrime + currentPrime; compositeIndex <= maxValue; compositeIndex += currentPrime) {
      isPrimeFlags[compositeIndex] = false;
    }
    // Initialize the maximum exponent for `currentPrime` to 0.
    maxPrimeExponents.set(currentPrime, 0);
  }

  // This array will store the prime factorization (as Maps) for each number in `numberArray`.
  const allPrimeFactorizations = [];
  // Iterate through each number in the input array to find its prime factors.
  for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
    let currentNumber = numberArray[elementIndex]; // The number currently being factorized.
    const currentNumberFactors = new Map(); // Map to hold prime factors and their exponents for `currentNumber`.
    allPrimeFactorizations.push(currentNumberFactors);

    // Iterate through all primes identified by the sieve.
    for (const [primeFactor, maxExponentSoFar] of maxPrimeExponents) {
      if (currentNumber === 1) {
        // Optimization: If `currentNumber` is 1, all its prime factors have been extracted.
        break;
      }
      let exponentCount = 0; // Counter for the exponent of `primeFactor` in `currentNumber`.
      // Continuously divide `currentNumber` by `primeFactor` as long as it's divisible.
      while (currentNumber % primeFactor === 0) {
        currentNumber /= primeFactor;
        exponentCount++;
      }
      if (exponentCount > 0) {
        // If `primeFactor` is indeed a factor, store its exponent.
        currentNumberFactors.set(primeFactor, exponentCount);
      }
      // Update the global maximum exponent for `primeFactor` if a higher exponent was found.
      if (exponentCount > maxExponentSoFar) {
        maxPrimeExponents.set(primeFactor, exponentCount);
      }
    }
  }

  // Calculate the final sum based on the computed prime factorizations and maximum exponents.
  let totalSum = 0; // Accumulator for the final result.

  // For each number, calculate a term and add it to the `totalSum`.
  for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
    let termValue = 1; // Initialize the term value for the current number.
    // Iterate through all unique prime factors found across all numbers.
    for (const [primeKey, globalMaxExponent] of maxPrimeExponents) {
      if (!globalMaxExponent) {
        // If this prime never appeared with an exponent greater than 0, skip it.
        continue;
      }
      // Get the exponent of `primeKey` in the current number's factorization. Default to 0 if not present.
      const currentNumberPrimeExponent = allPrimeFactorizations[elementIndex].get(primeKey) || 0;
      // Multiply `termValue` by `primeKey` raised to the power of (globalMaxExponent - currentNumberPrimeExponent).
      // All operations are performed modulo `moduloVal`.
      termValue = multiplyMod(termValue, primeKey ** (globalMaxExponent - currentNumberPrimeExponent));
    }
    // Add the calculated `termValue` to `totalSum`, applying modulo.
    totalSum = (totalSum + termValue) % moduloVal;
  }

  return totalSum; // Return the final computed sum.

})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Reads input from standard input.