'use strict';

// This function processes a given numerical input to find a specific sum related to its divisors.
function ProcessInput(rawData) {
  // Parse the input string into an integer.
  const targetNumber = parseInt(rawData.trim(), 10);

  // Handle the edge case where the input number is 1.
  if (targetNumber === 1) {
    console.log(0);
    return;
  }

  // Calculate an upper bound for prime generation using the square root of the target number.
  // We add 1 to ensure the limit is inclusive and covers potential factors.
  const sieveLimit = Math.floor(Math.sqrt(targetNumber)) + 1;

  // Initialize an array to mark numbers as prime or not using a sieve method.
  const primeFlags = [];
  for (let idx = 0; idx < sieveLimit; idx++) {
    primeFlags[idx] = true; // Assume all numbers are prime initially.
  }

  // 0 and 1 are not prime numbers.
  primeFlags[0] = primeFlags[1] = false;

  // Implement the Sieve of Eratosthenes to find primes up to sieveLimit.
  for (let currentNum = 0; currentNum < sieveLimit; currentNum++) {
    // If the current number is not prime, skip it.
    if (!primeFlags[currentNum]) {
      continue;
    }
    // Mark multiples of the current prime as not prime.
    // Start from 2*currentNum, as 1*currentNum is currentNum itself.
    for (let multiplier = 2; currentNum * multiplier <= sieveLimit; multiplier++) {
      primeFlags[currentNum * multiplier] = false;
    }
  }

  // Collect all prime numbers found by the sieve into a new array.
  const foundPrimes = [];
  for (let numCheck = 0; numCheck <= sieveLimit; numCheck++) {
    if (primeFlags[numCheck]) {
      foundPrimes.push(numCheck);
    }
  }

  // Initialize an array to store the counts of each prime factor for the target number.
  const primeFactorCounts = [];
  for (let countIdx = 0; countIdx <= foundPrimes.length; countIdx++) {
    primeFactorCounts[countIdx] = 0; // Initialize all counts to zero.
  }

  // Perform prime factorization of the target number.
  let currentProduct = 1; // Represents the product of factors found so far.
  let primeIndex = 0;     // Index for iterating through the foundPrimes array.

  // Loop until the current product equals or exceeds the target number.
  while (currentProduct < targetNumber) {
    // If the target number is divisible by (currentProduct * currentPrime),
    // it means currentPrime is a factor.
    while (targetNumber % (currentProduct * foundPrimes[primeIndex]) === 0) {
      primeFactorCounts[primeIndex]++; // Increment the count for this prime factor.
      currentProduct *= foundPrimes[primeIndex]; // Update the product.
    }
    primeIndex++; // Move to the next prime.
    // If we've exhausted our list of primes, break the loop.
    if (primeIndex === foundPrimes.length) {
      break;
    }
  }

  // Create a concentrated list of actual prime factors and their exponents.
  const distinctFactors = [];
  primeFactorCounts.forEach(function(exponentVal, idxPrime) {
    if (exponentVal >= 1) { // Only include primes that are actual factors.
      distinctFactors.push([foundPrimes[idxPrime], exponentVal]);
    }
  });

  // If after factorization, no distinct factors were found (e.g., if targetNumber was prime itself),
  // add the targetNumber as a factor with an exponent of 1.
  if (distinctFactors.length === 0) {
    distinctFactors.push([targetNumber, 1]);
  }

  // console.log(distinctFactors); // Debugging line for distinct factors.

  let resultSum = 0; // Initialize the variable to store the final sum.
  const currentDivisorComponents = []; // Temporary array to hold components of a divisor.

  // Calculate the total number of unique divisors based on the prime factorization.
  // This is done by multiplying (exponent + 1) for each distinct prime factor.
  const totalDivisorCombinations = distinctFactors.reduce((accumulator, currentFactorPair) => accumulator * (currentFactorPair[1] + 1), 1);

  // console.log(distinctFactors); // Another debugging line.

  // Iterate through all possible combinations to generate each divisor.
  for (let combinationIndex = 0; combinationIndex < totalDivisorCombinations; combinationIndex++) {
    let tempIndex = combinationIndex; // Use a temporary variable for combination calculation.

    // For each distinct prime factor, determine its exponent in the current divisor.
    distinctFactors.forEach(function(factorEntry, entryIndex) {
      let basePrime = factorEntry[0];    // The prime number itself.
      let maxExponent = factorEntry[1];  // The maximum exponent for this prime in targetNumber.

      // Calculate the exponent for the current divisor using modulo arithmetic.
      currentDivisorComponents[entryIndex] = [basePrime, tempIndex % (maxExponent + 1)];
      // Update tempIndex for the next prime factor.
      tempIndex = Math.floor(tempIndex / (maxExponent + 1));
    });

    // console.log(currentDivisorComponents); // Debugging line for divisor components.

    // Reconstruct the actual divisor from its prime components.
    let currentDivisor = currentDivisorComponents.reduce((productAccumulator, componentPair) => productAccumulator * (Math.pow(componentPair[0], componentPair[1])), 1);

    // console.log(currentDivisor); // Debugging line for the current divisor.

    // Apply the condition: if (N/r - 1) > r, add (N/r - 1) to the result sum.
    // This is equivalent to finding divisors 'r' such that N/r is a factor, and N/r - 1 > r.
    // This condition is related to finding specific pairs of factors (r, N/r).
    if (targetNumber / currentDivisor - 1 > currentDivisor) {
      resultSum += targetNumber / currentDivisor - 1;
    }
  }

  // Output the final calculated sum.
  console.log(resultSum);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
