console.log((inputData => {
  // Parse the input string. The first line contains the count of elements (N),
  // and the second line contains the space-separated numbers (A).
  const [[elementCount], numberSequence] = inputData.trim().split('\n').map(lineContent => lineContent.split(' ').map(stringValue => 0 | stringValue));

  // Define the prime modulus for calculations and find the maximum value in the input array.
  const primeModulo = 1_000_000_007; // A large prime number commonly used in competitive programming
  const maximumValue = Math.max(...numberSequence);

  // A utility function for performing modular multiplication to prevent integer overflow.
  // This specific implementation uses bitwise operations for efficiency.
  const modularMultiply = (factorOne, factorTwo) => {
    return ((factorOne >> 16) * factorTwo % primeModulo * 65536 + (factorOne & 65535) * factorTwo) % primeModulo;
  };

  // Initialize a boolean array for the Sieve of Eratosthenes to find primes up to a certain limit.
  // `primeSieve[k]` will be true if k is prime, false otherwise.
  const primeSieve = Array(1_000_000 + 1).fill(true);
  // This Map will store the highest exponent found for each prime factor across all numbers in `numberSequence`.
  const maxPrimeExponents = new Map();

  // Implement the Sieve of Eratosthenes to identify prime numbers up to `maximumValue`.
  // For each prime, initialize its maximum exponent in `maxPrimeExponents` to zero.
  for (let currentPrimeNum = 2; currentPrimeNum <= maximumValue; currentPrimeNum++) {
    // If the current number is not marked as prime, skip it as its multiples would have been handled.
    if (!primeSieve[currentPrimeNum]) continue;

    // Mark all multiples of the current prime as not prime.
    for (let idx = currentPrimeNum + currentPrimeNum; idx <= maximumValue; idx += currentPrimeNum) {
      primeSieve[idx] = false;
    }
    // Add the prime to our map of prime exponents, initially with an exponent of 0.
    maxPrimeExponents.set(currentPrimeNum, 0);
  }

  // This array will store the prime factorization for each number in the `numberSequence`.
  // Each element will be a Map where keys are primes and values are their exponents.
  const allPrimeFactors = [];

  // Iterate through each number in the input sequence to determine its prime factorization
  // and update the global `maxPrimeExponents` map.
  for (let indexCounter = 0; indexCounter < elementCount; indexCounter++) {
    let currentNumber = numberSequence[indexCounter];
    allPrimeFactors.push(new Map()); // Create a new map for the current number's factors

    // Iterate through the primes identified by the sieve.
    for (const [currentPrimeNum, highestExponent] of maxPrimeExponents) {
      // If the current number has been reduced to 1, all its prime factors have been found.
      if (currentNumber === 1) break;

      let primePowerCount = 0; // Counter for the exponent of `currentPrimeNum` in `currentNumber`
      // Continuously divide `currentNumber` by `currentPrimeNum` as long as it's divisible.
      while (currentNumber % currentPrimeNum === 0) {
        currentNumber /= currentPrimeNum;
        primePowerCount++;
      }

      // If `currentPrimeNum` was a factor, record its exponent for the current number.
      if (primePowerCount > 0) allPrimeFactors[indexCounter].set(currentPrimeNum, primePowerCount);
      // Update the global maximum exponent for `currentPrimeNum` if a higher one was found.
      if (primePowerCount > highestExponent) maxPrimeExponents.set(currentPrimeNum, primePowerCount);
    }
  }

  // Calculate the final sum based on the determined prime factorizations and maximum exponents.
  let finalSumResult = 0;
  for (let indexCounter = 0; indexCounter < elementCount; indexCounter++) {
    let currentTermValue = 1; // Initialize the term B for the current number

    // Iterate through all unique primes and their globally highest exponents.
    for (const [currentPrimeNum, requiredPower] of maxPrimeExponents) {
      // If the required power for this prime is zero, it does not contribute to the product.
      if (requiredPower === 0) continue;

      // Retrieve the exponent of `currentPrimeNum` in the current number's factorization.
      // Default to 0 if the prime is not a factor of the current number.
      const currentNumPrimePower = allPrimeFactors[indexCounter].get(currentPrimeNum) || 0;

      // Calculate the power difference (requiredPower - currentNumPrimePower) and
      // multiply `currentTermValue` by `currentPrimeNum` raised to this difference, modulo `primeModulo`.
      currentTermValue = modularMultiply(currentTermValue, currentPrimeNum ** (requiredPower - currentNumPrimePower));
    }
    // Add the calculated `currentTermValue` to the `finalSumResult`, applying modulo.
    finalSumResult = (finalSumResult + currentTermValue) % primeModulo;
  }

  // Return the final computed sum.
  return finalSumResult;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
