"use strict";

// Divergent Input Reader implementation
function InputProcessor(sourceText) {
  // Split the entire input by any sequence of whitespace characters,
  // then filter out any empty strings that might result from multiple spaces.
  this.tokenStream = sourceText.split(/\s+/).filter(Boolean);
  this.currentPosition = 0;
  // The original 'I' class used a function 'f' for conversion, defaulting to Number.
  // We explicitly set it here.
  this.valueConverter = Number; 
}

// Method to retrieve the next value from the input stream
InputProcessor.prototype.getNextValue = function() {
  if (this.currentPosition >= this.tokenStream.length) {
    // Return undefined or throw an error if no more tokens are available.
    // The original code implicitly returns undefined if a line is empty or out of bounds.
    return undefined; 
  }
  const nextToken = this.tokenStream[this.currentPosition];
  this.currentPosition++;
  return this.valueConverter(nextToken);
};

// The original 'l' method (I.prototype.l) is not utilized in the provided 'main' function.
// Therefore, its exact implementation is not critical for behavioral equivalence of 'main'.
// We provide a placeholder that returns an empty array, as it would not be called.
InputProcessor.prototype.getLineValues = function() {
  return [];
};

// Divergent Sieve of Eratosthenes implementation using a Set for candidates.
// This approach initializes a set of all potential primes and iteratively removes composites.
function primeGenerator(upperBound) {
  if (upperBound < 2) {
    return [];
  }
  
  // Initialize a Set with all integers from 2 up to upperBound.
  // Array.from is used to create a sequence of numbers.
  const candidateNumbers = new Set(Array.from({ length: upperBound - 1 }, (_, i) => i + 2));

  // Iterate through numbers up to the square root of the upperBound.
  // If a number 'p' is still in the set, it's prime.
  for (let p = 2; p * p <= upperBound; p++) {
    if (candidateNumbers.has(p)) {
      // Remove all multiples of 'p' (starting from p*p) from the set.
      for (let multiple = p * p; multiple <= upperBound; multiple += p) {
        candidateNumbers.delete(multiple);
      }
    }
  }
  
  // Convert the Set of remaining primes to an array and sort it numerically.
  return Array.from(candidateNumbers).sort((a, b) => a - b);
}

// Pre-calculate primes using the new generator function.
var allPrimes = primeGenerator(100000);

// Iterative Euclidean algorithm for Greatest Common Divisor.
// This is a common alternative to the recursive version.
function computeGreatestCommonDivisor(val1, val2) {
  while (val2 !== 0) {
    // Use array destructuring to swap values and compute remainder in one line.
    [val1, val2] = [val2, val1 % val2];
  }
  return val1;
}

function processInputAndSolve(inputString) {
  const tokenSource = new InputProcessor(inputString);

  const countN = tokenSource.getNextValue();
  
  // Read N+1 numbers into an array using Array.from with a mapping function.
  const initialData = Array.from({ length: countN + 1 }, () => tokenSource.getNextValue());

  // Create a reversed version of the array by iterating backwards and pushing.
  // This avoids using the built-in .reverse() method directly.
  const reversedData = [];
  for (let k = initialData.length - 1; k >= 0; --k) {
    reversedData.push(initialData[k]);
  }

  // Calculate the GCD of all elements in the reversed array using Array.prototype.reduce.
  // Math.abs is applied to ensure the GCD is positive, matching original behavior.
  const overallGCD = reversedData.reduce((accumulator, currentVal) =>
    Math.abs(computeGreatestCommonDivisor(accumulator, currentVal))
  );

  // Normalize the array elements by dividing each by the overallGCD using Array.prototype.map.
  const normalizedData = reversedData.map(val => val / overallGCD);

  const discoveredPrimes = [];

  // Filter the pre-calculated primes to only include those less than or equal to countN.
  const relevantPrimes = allPrimes.filter(p => p <= countN);

  // Iterate through the relevant primes to find those satisfying the conditions.
  for (const currentPrime of relevantPrimes) {
    // Check the first condition: normalizedData[0] must be divisible by currentPrime.
    if (normalizedData[0] % currentPrime !== 0) {
      continue; // If not divisible, skip to the next prime.
    }

    // Use Array.from to generate remainder values (1 to currentPrime - 1).
    // Then, use Array.prototype.every to check if all these remainder conditions are met.
    const allRemainderConditionsMet = Array.from({ length: currentPrime - 1 }, (_, i) => i + 1)
      .every(remainderValue => {
        // For each remainder, generate the specific indices to sum.
        const indicesToSum = [];
        for (let idx = remainderValue; idx <= countN; idx += (currentPrime - 1)) {
          indicesToSum.push(idx);
        }
        // Sum the elements at the generated indices using Array.prototype.reduce.
        const currentSum = indicesToSum.reduce((acc, idx) => acc + normalizedData[idx], 0);
        // The condition is that the sum must be divisible by currentPrime.
        return currentSum % currentPrime === 0;
      });

    // If all remainder conditions pass, add the currentPrime to the discovered list.
    if (allRemainderConditionsMet) {
      discoveredPrimes.push(currentPrime);
    }
  }

  // Factorize the overallGCD into its prime components and add them to discoveredPrimes.
  let remainingDivisor = overallGCD;
  for (const primeFactorCandidate of allPrimes) {
    // Optimization: if the square of the candidate prime exceeds the remaining divisor,
    // then the remaining divisor must be prime itself (or 1).
    if (primeFactorCandidate * primeFactorCandidate > remainingDivisor) {
      break;
    }
    if (remainingDivisor % primeFactorCandidate === 0) {
      discoveredPrimes.push(primeFactorCandidate);
      // Continuously divide remainingDivisor by primeFactorCandidate until it's no longer divisible.
      while (remainingDivisor % primeFactorCandidate === 0) {
        remainingDivisor /= primeFactorCandidate;
      }
    }
  }
  // If, after the loop, remainingDivisor is still greater than 1, it means it's a prime factor itself.
  if (remainingDivisor > 1) {
    discoveredPrimes.push(remainingDivisor);
  }

  // Use a Set to get unique primes, convert back to an array, and sort numerically.
  // Then, use forEach to print each unique prime to the console.
  const uniqueSortedPrimes = [...new Set(discoveredPrimes)].sort((a, b) => a - b);
  uniqueSortedPrimes.forEach(val => console.log(val));
}

// Execute the main processing function with input read from stdin.
processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
