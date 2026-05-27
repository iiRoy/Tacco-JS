function readInput() {
  // Reads input from standard input, trims whitespace, and returns it as a string.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function printOutput(message) {
  // Outputs the given message to the console.
  console.log(message);
}

/**
 * Transforms the input string based on the specified conversion type.
 * @param {string} dataStr - The input string to convert.
 * @param {number} conversionType - The type of conversion to apply.
 *   0: No conversion (return as is)
 *   1: Convert to integer
 *   2: Split by space
 *   3: Split by newline
 *   4: Split by space and convert to number array
 *   5: Split by newline and convert to number array
 *   6: Split into individual characters
 *   7: Split into individual characters and convert to number array
 * @returns {any} The converted data.
 */
function transformInput(dataStr, conversionType) {
  switch (conversionType) {
    case 0:
      return dataStr;
    case 1:
      return parseInt(dataStr);
    case 2:
      return dataStr.split(" ");
    case 3:
      return dataStr.split("\n");
    case 4:
      return dataStr.split(" ").map((element) => Number(element));
    case 5:
      return dataStr.split("\n").map((element) => Number(element));
    case 6:
      return dataStr.split("");
    case 7:
      return dataStr.split("").map((element) => Number(element));
    default:
      return dataStr; // Default to no conversion if type is unknown
  }
}

function processData(rawInput) {
  // Convert the raw input string to an integer.
  rawInput = transformInput(rawInput, 1);

  // This algorithm calculates the number of divisors for a given integer 'rawInput'.
  // The number of divisors is found by taking the product of (exponent + 1) for each prime factor.
  // For example, if N = p1^a * p2^b, then the number of divisors is (a+1)*(b+1).

  // 'primeFactorCounts' will store the count of each prime factor up to 'rawInput'.
  // Initialize an array with zeros.
  const primeFactorCounts = new Array(rawInput + 1).fill(0);
  const moduloValue = 1000000007; // A large prime number for modulo operations.

  // Iterate from 1 up to the input number.
  for (let currentNum = 1; currentNum <= rawInput; currentNum++) {
    if (currentNum === 1) {
      // The number 1 has no prime factors in this context, or its only factor is 1 itself.
      // For divisor count calculation, it doesn't contribute to prime factor exponents.
      // We can effectively skip it or handle it as a base case.
      // The original code sets list[1] = 1, which is not directly used in the final product.
      // Let's keep the original behavior for Type II.
      primeFactorCounts[1] = 1;
      continue;
    } else {
      let tempNum = currentNum; // Use a temporary variable for factorization.
      // Find prime factors of 'tempNum'.
      for (let divisor = 2; divisor <= tempNum;) {
        if (tempNum % divisor === 0) {
          // If 'divisor' is a factor, increment its count and divide 'tempNum'.
          primeFactorCounts[divisor]++;
          tempNum /= divisor;
        } else {
          // If not a factor, try the next potential divisor.
          divisor++;
        }
      }
    }
  }

  // Calculate the total number of divisors using the prime factor counts.
  // The result is the product of (exponent + 1) for each prime factor, modulo 'moduloValue'.
  let resultDivisorCount = 1;
  for (let currentPrime = 2; currentPrime < primeFactorCounts.length; currentPrime++) {
    if (primeFactorCounts[currentPrime] !== 0) {
      // If a prime factor appeared, multiply the result by (its count + 1).
      // Apply modulo at each step to prevent overflow.
      resultDivisorCount = (resultDivisorCount * (primeFactorCounts[currentPrime] + 1)) % moduloValue;
    }
  }

  // Output the final calculated number of divisors.
  printOutput(resultDivisorCount);
}

// Execute the main processing function with input from stdin.
processData(readInput());
