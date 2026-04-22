(inputString => {
  // --- Input Parsing and Initial Setup ---
  // A Type III addition: basic input validation/guard clause for empty or invalid input.
  if (typeof inputString !== 'string' || inputString.trim().length === 0) {
    return 0; // Return a default value or throw an error for invalid input.
  }

  // Split the input string into individual lines.
  const inputLines = inputString.trim().split('\n');

  // Parse the first line to get the total quantity of numbers.
  // Using `parseInt` with radix for explicit conversion, replacing the bitwise OR `0|v`.
  const quantityOfNumbers = parseInt(inputLines[0].trim(), 10);
  if (isNaN(quantityOfNumbers) || quantityOfNumbers <= 0) {
    return 0; // Guard clause for invalid quantity.
  }

  // Parse the second line to get the array of numbers.
  const numberCollection = inputLines[1].trim().split(' ').map(val => parseInt(val, 10));

  // Type III addition: Optional validation to check if the number of elements matches the declared quantity.
  if (numberCollection.length !== quantityOfNumbers) {
    // In competitive programming, this might be assumed, but for robust code, it's a good check.
    // For this context, we'll proceed assuming the first N elements are relevant, or that input is guaranteed.
  }

  // Define the modulus constant for all calculations.
  const resultModulus = 1000000007; // Common prime modulus (10^9 + 7).
  
  // Determine the maximum value in the input array to set the upper bound for the sieve.
  const upperSieveLimit = Math.max(...numberCollection);

  // --- Helper Functions for Modular Arithmetic ---

  /**
   * Computes (base ^ exponent) % modulus using modular exponentiation (binary exponentiation).
   * This is a crucial Type III addition/correction, as direct `**` can lead to `Number.MAX_SAFE_INTEGER` overflow
   * before the modulo operation, especially for large bases and exponents.
   */
  const calculateModularPower = (baseValue, powerExponent, currentModulus) => {
    let computedResult = 1;
    baseValue %= currentModulus; // Reduce base modulo modulus to avoid large intermediate products.
    while (powerExponent > 0) {
      // If exponent is odd, multiply result by base.
      if (powerExponent % 2 === 1) {
        computedResult = Number((BigInt(computedResult) * BigInt(baseValue)) % BigInt(currentModulus));
      }
      // Square the base for the next iteration.
      baseValue = Number((BigInt(baseValue) * BigInt(baseValue)) % BigInt(currentModulus));
      // Halve the exponent.
      powerExponent = Math.floor(powerExponent / 2);
    }
    return computedResult;
  };

  /**
   * Computes (factorA * factorB) % resultModulus.
   * With `calculateModularPower` handling large exponents, both factors will now be less than `resultModulus`.
   * Using BigInt for intermediate product ensures correctness even if (factorA * factorB) exceeds `Number.MAX_SAFE_INTEGER`
   * but is still less than `resultModulus * resultModulus`.
   * This simplifies the original complex `mul` function, making it a Type III simplification.
   */
  const performModularMultiplication = (factorA, factorB) => {
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(resultModulus));
  };


  // --- Sieve of Eratosthenes: Identify Prime Numbers up to upperSieveLimit ---

  // Boolean array to track primality. `true` means potentially prime.
  const isNumberPrime = Array(upperSieveLimit + 1).fill(true);
  isNumberPrime[0] = false; // 0 is not prime.
  isNumberPrime[1] = false; // 1 is not prime.

  // Execute the sieve algorithm.
  for (let currentPrimeCandidate = 2; currentPrimeCandidate * currentPrimeCandidate <= upperSieveLimit; currentPrimeCandidate++) {
    // If currentPrimeCandidate is marked as prime, then its multiples are composite.
    if (isNumberPrime[currentPrimeCandidate]) {
      // Start marking multiples from currentPrimeCandidate squared (optimization).
      for (let multiple = currentPrimeCandidate * currentPrimeCandidate; multiple <= upperSieveLimit; multiple += currentPrimeCandidate) {
        isNumberPrime[multiple] = false;
      }
    }
  }

  // Map to store the maximum exponent observed for each prime factor across all numbers in `numberCollection`.
  // Initialized for all primes found by the sieve. This replaces `px` from the original.
  const globalMaximumPrimeExponents = new Map();
  for (let primeValue = 2; primeValue <= upperSieveLimit; primeValue++) {
    if (isNumberPrime[primeValue]) {
      globalMaximumPrimeExponents.set(primeValue, 0); // Initialize max exponent to 0.
    }
  }


  // --- Prime Factorization of Each Number in the Collection ---

  // An array where each element is a Map representing the prime factorization of a number from `numberCollection`.
  // This replaces `ap` from the original code.
  const individualNumberFactorizations = [];

  // Iterate through each number provided in the input.
  for (let collectionIndex = 0; collectionIndex < quantityOfNumbers; collectionIndex++) {
    let currentNumberBeingProcessed = numberCollection[collectionIndex];
    const currentNumberFactorsMap = new Map(); // Store factors for the current number.

    // Iterate through primes up to the square root of the current number.
    // This is an optimized approach for prime factorization.
    for (let primeDivisor = 2; primeDivisor * primeDivisor <= currentNumberBeingProcessed; primeDivisor++) {
      // Only proceed if `primeDivisor` is indeed a prime number.
      if (isNumberPrime[primeDivisor]) {
        let factorCount = 0;
        // Count occurrences of `primeDivisor` in `currentNumberBeingProcessed`.
        while (currentNumberBeingProcessed % primeDivisor === 0) {
          currentNumberBeingProcessed /= primeDivisor;
          factorCount++;
        }
        if (factorCount > 0) {
          currentNumberFactorsMap.set(primeDivisor, factorCount);
          // Update the global maximum exponent for this prime factor.
          // Using `?? 0` for nullish coalescing, a modern JS alternative to `|0` for default values.
          globalMaximumPrimeExponents.set(primeDivisor, Math.max(globalMaximumPrimeExponents.get(primeDivisor) ?? 0, factorCount));
        }
      }
    }

    // If `currentNumberBeingProcessed` is still greater than 1 after the loop,
    // it means the remaining value is a prime factor itself (larger than its square root).
    if (currentNumberBeingProcessed > 1) {
      // Add this remaining prime factor.
      currentNumberFactorsMap.set(currentNumberBeingProcessed, (currentNumberFactorsMap.get(currentNumberBeingProcessed) ?? 0) + 1);
      // Update the global maximum exponent for this prime.
      globalMaximumPrimeExponents.set(currentNumberBeingProcessed, Math.max(globalMaximumPrimeExponents.get(currentNumberBeingProcessed) ?? 0, (currentNumberFactorsMap.get(currentNumberBeingProcessed) ?? 0)));
    }
    individualNumberFactorizations.push(currentNumberFactorsMap);
  }

  // --- Final Calculation of the Sum ---

  let finalSumAccumulator = 0; // Initialize the total sum.

  // Type III addition: Filter `globalMaximumPrimeExponents` to only include primes that
  // actually divided at least one number. This makes the iteration more efficient and
  // consistent with the original logic's `px` usage in the final loop.
  const relevantPrimesWithMaxExponents = new Map();
  for (const [prime, maxExponent] of globalMaximumPrimeExponents.entries()) {
      if (maxExponent > 0) {
          relevantPrimesWithMaxExponents.set(prime, maxExponent);
      }
  }

  // Iterate through each number's factorization to compute its contribution to the sum.
  for (let collectionIndex = 0; collectionIndex < quantityOfNumbers; collectionIndex++) {
    let currentTermValue = 1; // This represents 'B' from the original code.
    const currentFactorsForThisNumber = individualNumberFactorizations[collectionIndex];

    // Iterate over all primes that were factors of any number in the input.
    for (const [primeFactor, requiredGlobalMaxExponent] of relevantPrimesWithMaxExponents.entries()) {
      // Get the exponent of `primeFactor` in the current number. Default to 0 if not present.
      const exponentInCurrentNumber = currentFactorsForThisNumber.get(primeFactor) ?? 0;

      // Calculate the difference in exponents.
      const exponentDifference = requiredGlobalMaxExponent - exponentInCurrentNumber;

      // Only multiply if the exponent difference is positive.
      // If it's 0, the term is 1 (p^0), so no multiplication needed.
      // A negative difference would imply an error in `requiredGlobalMaxExponent` logic.
      if (exponentDifference > 0) {
        // Calculate (primeFactor ^ exponentDifference) % resultModulus.
        const primePowerComponent = calculateModularPower(primeFactor, exponentDifference, resultModulus);
        // Multiply into the current term value, modulo resultModulus.
        currentTermValue = performModularMultiplication(currentTermValue, primePowerComponent);
      }
    }
    // Add the calculated term for the current number to the final sum.
    finalSumAccumulator = (finalSumAccumulator + currentTermValue) % resultModulus;
  }

  // Return the final accumulated sum.
  return finalSumAccumulator;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));