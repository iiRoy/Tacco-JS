// Function to determine if a given integer is a prime number.
function checkPrimality(candidateNumber) {
  // Input validation: prime numbers are positive integers greater than 1.
  // This guard clause ensures only valid numerical inputs are processed.
  if (typeof candidateNumber !== 'number' || !Number.isInteger(candidateNumber) || candidateNumber <= 1) {
    return false;
  }

  // Handle small prime numbers (2 and 3) directly for efficiency.
  if (candidateNumber <= 3) {
    return true;
  }

  // Eliminate numbers divisible by 2 or 3, as these are not prime (except 2 and 3 themselves, which are handled above).
  if (candidateNumber % 2 === 0 || candidateNumber % 3 === 0) {
    return false;
  }

  // Optimized loop: check for divisibility by numbers of the form 6k ± 1.
  // All prime numbers greater than 3 can be expressed in this form.
  // The loop iterates starting from 5 and increments by 6 (checking 'i' and 'i+2').
  // We only need to check up to the square root of the candidate number.
  for (let currentDivisor = 5; (currentDivisor * currentDivisor) <= candidateNumber; currentDivisor += 6) {
    if (candidateNumber % currentDivisor === 0 || candidateNumber % (currentDivisor + 2) === 0) {
      // If a divisor is found, the number is not prime.
      return false;
    }
  }

  // If no divisors were found throughout the checks, the number is prime.
  return true;
}

// Function to calculate the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
// This implementation is recursive.
function computeGreatestCommonDivisor(firstOperand, secondOperand) {
  // Base case for the recursion: if the second operand is zero, the GCD is the absolute value of the first operand.
  // Using Math.abs() ensures a positive result even if initial inputs were negative.
  if (secondOperand === 0) {
    return Math.abs(firstOperand);
  }
  // Recursive step: GCD(a, b) = GCD(b, a % b).
  // The remainder operation progressively reduces the numbers until one becomes zero.
  return computeGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

// Main function responsible for processing the input data, calculating GCD,
// finding its divisors, and counting how many of those divisors are prime.
function processInputData(rawData) {
  // Trim whitespace and split the raw input string into an array of lines.
  const inputLines = rawData.trim().split('\n');
  // The first line is expected to contain two space-separated numbers.
  // Using /\s+/ handles multiple spaces or other whitespace characters between numbers.
  const numericStrings = inputLines[0].split(/\s+/);

  // Convert the string representations of numbers into integer types.
  // Using parseInt with radix 10 is good practice.
  const initialValueA = parseInt(numericStrings[0], 10);
  const initialValueB = parseInt(numericStrings[1], 10);

  // Calculate the greatest common divisor (GCD) of the two input values.
  const calculatedGCD = computeGreatestCommonDivisor(initialValueA, initialValueB);

  // Guard clause: If the calculated GCD is non-positive, it cannot have positive prime divisors.
  // Output 0 and terminate early.
  if (calculatedGCD <= 0) {
      console.log(0);
      return;
  }

  // Find all unique divisors of the calculated GCD.
  // A Set is used to automatically store only unique values, which is useful when iterating up to sqrt(GCD).
  const uniqueDivisors = new Set();
  // We only need to iterate up to the square root of the GCD to find all pairs of divisors.
  const limit = Math.sqrt(calculatedGCD);

  for (let currentDivisorCandidate = 1; currentDivisorCandidate <= limit; currentDivisorCandidate++) {
    // If currentDivisorCandidate divides calculatedGCD evenly, then it's a divisor.
    if (calculatedGCD % currentDivisorCandidate === 0) {
      uniqueDivisors.add(currentDivisorCandidate); // Add the current divisor.
      uniqueDivisors.add(calculatedGCD / currentDivisorCandidate); // Add its complement (GCD / current divisor).
    }
  }

  // Convert the Set of unique divisors into an Array for easier iteration and filtering.
  const allDivisors = Array.from(uniqueDivisors);

  // Count how many of these unique divisors are prime numbers.
  let totalPrimeDivisorCount = 0;
  // Iterate over each divisor found and use the prime checking function.
  for (const divisorValue of allDivisors) {
    if (checkPrimality(divisorValue)) {
      totalPrimeDivisorCount++;
    }
  }

  // Output the final count of prime divisors of the GCD to the console.
  console.log(totalPrimeDivisorCount);
}

// Execute the main processing function.
// This line reads input from standard input, typically used in competitive programming environments.
// It assumes a Node.js environment where 'fs' module is available.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));