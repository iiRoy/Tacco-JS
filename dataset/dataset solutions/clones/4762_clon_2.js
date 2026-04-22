function obtainInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function displayResult(computedValue) {
  console.log(computedValue);
} /* This function outputs the calculated value to the console. */

/*
 * Conversion parameter guide:
 * 0: No transformation
 * 1: Parse to integer
 * 2: Split by single space
 * 3: Split by newline character
 * 4: Split by single space, then map to numbers
 * 5: Split by newline character, then map to numbers
 * 6: Split into individual characters
 * 7: Split into individual characters, then map to numbers
 */
function performTransformation(inputString, transformationType) {
  switch (transformationType) {
    case 0:
      return inputString;
    case 1:
      return parseInt(inputString);
    case 2:
      return inputString.split(" ");
    case 3:
      return inputString.split("\n");
    case 4:
      return inputString.split(" ").map((item) => Number(item));
    case 5:
      return inputString.split("\n").map((item) => Number(item));
    case 6:
      return inputString.split("");
    case 7:
      return inputString.split("").map((item) => Number(item));
  }
}

function Calculation(inputValue) {
  // Convert the initial input to an integer using the transformation utility.
  let processedInput = performTransformation(inputValue, 1);

  /*
   * The number of divisors of an integer N is found by taking the product of (exponent + 1) for each prime factor in its prime factorization.
   * For example, if N = p1^a * p2^b, then the number of divisors is (a+1)*(b+1).
   */
  // This array will store the counts of each prime factor for all numbers up to 'processedInput'.
  let primeFactorExponents = new Array(processedInput + 1).fill(0);

  const modulusValue = 1000000007; // A large prime number used for modular arithmetic.

  for (let currentNumber = 1; currentNumber <= processedInput; currentNumber++) {
    if (currentNumber === 1) {
      primeFactorExponents[1] = 1; // Special case: 1 has one divisor (itself).
      continue;
    } else {
      let tempNumber = currentNumber;
      // Find prime factors for the current number.
      for (let potentialFactor = 2; potentialFactor <= tempNumber;) {
        if (tempNumber % potentialFactor === 0) {
          primeFactorExponents[potentialFactor]++; // Increment count for this prime factor.
          tempNumber /= potentialFactor; // Divide tempNumber by the found factor.
        } else {
          potentialFactor++; // Move to the next potential factor.
        }
      }
    }
  }

  let finalDivisorCount = 1; // Initialize the total divisor count.

  // Calculate the total number of divisors using the stored prime factor exponents.
  for (let factorIndex = 2; factorIndex < primeFactorExponents.length; factorIndex++) {
    if (primeFactorExponents[factorIndex] !== 0) {
      // Apply the formula (exponent + 1) for each prime factor and take modulo.
      finalDivisorCount = (finalDivisorCount * (primeFactorExponents[factorIndex] + 1)) % modulusValue;
    }
  }

  // displayResult(primeFactorExponents); // Debugging line: shows the array of prime factor counts.
  displayResult(finalDivisorCount); // Output the final calculated number of divisors.
}

// Execute the main calculation flow by first obtaining input and then processing it.
Calculation(obtainInput());