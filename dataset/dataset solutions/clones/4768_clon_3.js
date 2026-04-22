// Function responsible for securely obtaining the initial raw input data from a designated source.
function acquireInputData() {
  try {
    // Attempt to read the entire content of standard input in UTF-8 format.
    const rawDataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    // Remove any leading or trailing whitespace characters from the acquired data.
    return rawDataBuffer.trim();
  } catch (errorReadingInput) {
    // If an error occurs during the input reading process, log it and provide a default.
    console.error("An issue occurred while attempting to read from standard input:", errorReadingInput.message);
    // Return an empty string as a fallback to prevent subsequent errors.
    return "";
  }
}

// Function dedicated to presenting the final calculated outcome to the user.
function displayResult(finalCalculatedValue) {
  // Output the result to the console, clearly indicating what the value represents.
  console.log(`Final Computed Value: ${finalCalculatedValue}`);
}

// A versatile utility function designed to transform an input string based on a specified parsing rule.
// Available parsing strategies:
//   0: Return the input string without any modification.
//   1: Convert the input string into a base-10 integer. Invalid numeric inputs yield 0.
//   2: Split the string by single space characters, resulting in an array of substrings.
//   3: Split the string by newline characters, producing an array of substrings.
//   4: Split by spaces, then convert each resulting substring into a numeric type. Returns an array of numbers.
//   5: Split by newlines, then convert each resulting substring into a numeric type. Returns an array of numbers.
//   6: Break the string down into an array where each element is a single character.
//   7: Break the string down into single characters, then convert each to a numeric type. Returns an array of numbers.
function parseValueByStrategy(sourceValue, transformationRule) {
  // Employing an if-else if construct for distinct parsing paths.
  if (transformationRule === 0) {
    return sourceValue;
  } else if (transformationRule === 1) {
    // Attempt to parse as an integer. If parsing fails (NaN), default to 0.
    const integerValue = parseInt(sourceValue, 10);
    return Number.isNaN(integerValue) ? 0 : integerValue;
  } else if (transformationRule === 2) {
    return sourceValue.split(" ");
  } else if (transformationRule === 3) {
    return sourceValue.split("\n");
  } else if (transformationRule === 4) {
    // Iterate and explicitly convert each segment to a Number type.
    return sourceValue.split(" ").map((segmentPart) => Number(segmentPart));
  } else if (transformationRule === 5) {
    return sourceValue.split("\n").map((segmentPart) => Number(segmentPart));
  } else if (transformationRule === 6) {
    return sourceValue.split("");
  } else if (transformationRule === 7) {
    return sourceValue.split("").map((character) => Number(character));
  } else {
    // For any unrecognized rule, issue a warning and return the original input.
    console.warn(`Unrecognized conversion strategy specified: ${transformationRule}. Original input returned.`);
    return sourceValue;
  }
}

// The primary computational routine that determines the product of (exponent + 1)
// for all unique prime factors accumulated from numbers up to a given maximum limit.
// This effectively computes the product of (total count of prime_p + 1) for each prime p,
// where total count is sum of exponents of p in prime factorization of all numbers from 1 to N.
function calculateFactorialDivisorsProduct(maximumLimitString) {
  // Convert the string-based limit into a validated integer.
  let numericalUpperLimit = parseValueByStrategy(maximumLimitString, 1);

  // Implement a guard clause to validate the input limit.
  // The limit must be a positive integer to proceed with calculations.
  if (!Number.isInteger(numericalUpperLimit) || numericalUpperLimit <= 0) {
    console.error(`Invalid input provided for calculation limit: ${numericalUpperLimit}. Expecting a positive integer.`);
    displayResult(0); // Indicate an error by displaying a zero result.
    return; // Halt further execution of the function.
  }

  // Initialize an array to keep track of the total exponents for each prime factor.
  // The array index corresponds to a potential prime number, and its value is the sum of its exponents.
  // Using Uint32Array for memory efficiency with non-negative integer counts.
  const primeExponentAccumulator = new Uint32Array(numericalUpperLimit + 1).fill(0);

  // Define the modulus constant to be used in all multiplicative operations
  // to prevent integer overflow and keep results within a specific range.
  const computationalModulus = 1000000007; // A frequently used large prime modulus.

  // Iterate through each number from 2 up to the specified upper limit.
  // Number 1 is excluded as it has no prime factors and doesn't affect the product of (exponent+1) terms.
  for (let currentIterationNumber = 2; currentIterationNumber <= numericalUpperLimit; ++currentIterationNumber) {
    let numberToFactorize = currentIterationNumber; // A mutable copy for factorization.

    // First, efficiently handle the prime factor 2.
    // Repeatedly divide by 2 and increment its exponent count until it's no longer divisible.
    while (numberToFactorize > 1 && numberToFactorize % 2 === 0) {
      primeExponentAccumulator[2]++;
      numberToFactorize /= 2;
    }

    // Next, iterate through odd numbers starting from 3 as potential prime divisors.
    // Optimization: Only check divisors up to the square root of the remaining numberToFactorize.
    for (let currentDivisor = 3; currentDivisor * currentDivisor <= numberToFactorize; currentDivisor += 2) {
      // For each odd divisor, repeatedly divide and count as long as it's a factor.
      while (numberToFactorize > 1 && numberToFactorize % currentDivisor === 0) {
        primeExponentAccumulator[currentDivisor]++;
        numberToFactorize /= currentDivisor;
      }
    }

    // If, after all divisions, numberToFactorize is still greater than 1,
    // it implies that the remaining value itself is a prime factor.
    if (numberToFactorize > 1) {
      primeExponentAccumulator[numberToFactorize]++;
    }
  }

  // Initialize the final product accumulator.
  let finalProductResult = 1;

  // Iterate through the accumulated prime exponents, starting from index 2 (smallest prime).
  for (let primeCandidateIndex = 2; primeCandidateIndex < primeExponentAccumulator.length; ++primeCandidateIndex) {
    const currentPrimeTotalExponent = primeExponentAccumulator[primeCandidateIndex];

    // Only consider primes that actually appeared (i.e., have an exponent > 0).
    if (currentPrimeTotalExponent > 0) {
      // Calculate the term (total exponent + 1) for the current prime.
      const termContribution = currentPrimeTotalExponent + 1;
      // Multiply this term into the running product, applying the modulus at each step
      // to prevent intermediate results from exceeding JavaScript's safe integer limits.
      finalProductResult = (finalProductResult * termContribution) % computationalModulus;
    }
  }

  // Pass the final computed product to the display function.
  displayResult(finalProductResult);
}

// The initial function call that orchestrates the entire application flow.
function initializeApplication() {
  // Retrieve the raw input string.
  const rawInputString = acquireInputData();
  // Pass the raw input to the main calculation function.
  calculateFactorialDivisorsProduct(rawInputString);
}

// Execute the application's entry point.
initializeApplication();