const ARITHMETIC_MODULO = 998244353; // A large prime number for modular arithmetic operations, renamed for clarity.

// Caches for precomputed factorial values and their modular inverses.
// Initialized with values for 0! and 1!
let factorialValues = [1, 1];
let inverseFactorialValues = [1, 1];

/**
 * Performs a single modular multiplication (A * B) % M,
 * handling potential intermediate overflow for large numbers in JavaScript.
 * This specific implementation splits 'A' into 16-bit parts to avoid
 * exceeding JavaScript's Number.MAX_SAFE_INTEGER during the multiplication
 * before applying the modulo. This is crucial when A, B, and M are large.
 *
 * @param {number} operandA The first number in the multiplication.
 * @param {number} operandB The second number in the multiplication.
 * @param {number} modulus The modulo value (ARITHMETIC_MODULO).
 * @returns {number} The result of (operandA * operandB) % modulus.
 */
function _performSingleModularMultiplication(operandA, operandB, modulus) {
  // Split operandA into its high and low 16-bit components.
  // Example: A = A_high * 2^16 + A_low
  const highPartA = operandA >>> 16; // Unsigned right shift to get the high 16 bits.
  const lowPartA = operandA & 0xFFFF; // Bitwise AND to mask and get the low 16 bits.

  // Calculate ( (A_high * B % M) * 2^16 + (A_low * B) ) % M
  // This approach ensures that intermediate products (e.g., A_high * B)
  // do not exceed safe integer limits before the final modulo operation.
  let intermediateProduct = (highPartA * operandB % modulus * 0x10000 + lowPartA * operandB);
  return intermediateProduct % modulus;
}

/**
 * Performs modular multiplication for a chain of arguments: (arg1 * arg2 * ... * argN) % ARITHMETIC_MODULO.
 * It iteratively applies the single modular multiplication function.
 *
 * @param {...number} factors The numbers to multiply.
 * @returns {number} The product of all provided factors modulo ARITHMETIC_MODULO.
 */
function chainModularMultiplication(...factors) {
  // If no factors are provided, the multiplicative identity is 1.
  if (factors.length === 0) {
    return 1;
  }

  // Initialize the cumulative product with the first factor.
  let currentAccumulatedProduct = factors[0];
  // Multiply the remaining factors sequentially.
  for (let i = 1; i < factors.length; ++i) {
    currentAccumulatedProduct = _performSingleModularMultiplication(currentAccumulatedProduct, factors[i], ARITHMETIC_MODULO);
  }
  return currentAccumulatedProduct;
}

/**
 * Calculates (base ^ exponent) % ARITHMETIC_MODULO using the efficient binary exponentiation (exponentiation by squaring) method.
 *
 * @param {number} baseValue The base of the exponentiation.
 * @param {number} exponentValue The exponent.
 * @returns {number} The result of (baseValue ^ exponentValue) % ARITHMETIC_MODULO.
 */
function calculateModularPower(baseValue, exponentValue) {
  let finalPowerResult = 1;
  let currentBase = baseValue; // The base value that gets squared in each step.

  // Iterate while the exponent is positive.
  while (exponentValue > 0) {
    // If the current bit of the exponent is 1 (i.e., exponentValue is odd),
    // multiply the current result by the current base.
    if ((exponentValue & 1) !== 0) { // Check if the least significant bit is 1.
      finalPowerResult = chainModularMultiplication(finalPowerResult, currentBase);
    }
    // Square the base for the next iteration (effectively handling the next bit of the exponent).
    currentBase = chainModularMultiplication(currentBase, currentBase);
    // Right shift the exponent by 1 (equivalent to integer division by 2).
    exponentValue >>>= 1;
  }
  return finalPowerResult;
}

/**
 * Computes factorials up to a specified upper limit and caches them in `factorialValues`.
 * This function extends the cache only if needed.
 *
 * @param {number} upperLimit The maximum number for which to compute factorial.
 * @returns {number} The factorial of upperLimit modulo ARITHMETIC_MODULO.
 */
function precomputeFactorials(upperLimit) {
  // Guard clause: Factorials are typically defined for non-negative integers.
  if (upperLimit < 0) {
    console.error("Error: Factorial limit cannot be negative.");
    return 0; // Return 0 or throw an error for invalid input.
  }

  // Extend the `factorialValues` cache from its current length up to the `upperLimit`.
  for (let index = factorialValues.length; index <= upperLimit; ++index) {
    factorialValues[index] = chainModularMultiplication(factorialValues[index - 1], index);
  }
  return factorialValues[upperLimit];
}

/**
 * Computes modular inverse factorials up to a specified upper limit and caches them in `inverseFactorialValues`.
 * It first ensures factorials are computed, then calculates the largest inverse factorial using Fermat's Little Theorem,
 * and finally iteratively computes smaller inverse factorials.
 *
 * @param {number} upperLimit The maximum number for which to compute the modular inverse factorial.
 */
function precomputeInverseFactorials(upperLimit) {
  // Guard clause: Inverse factorials are typically defined for non-negative integers.
  if (upperLimit < 0) {
    console.error("Error: Inverse factorial limit cannot be negative.");
    return;
  }

  // Ensure that factorials up to `upperLimit` are already computed and available.
  if (!factorialValues[upperLimit]) {
    precomputeFactorials(upperLimit);
  }

  // Calculate the modular inverse of `upperLimit!` using Fermat's Little Theorem: a^(M-2) % M.
  // This is valid because ARITHMETIC_MODULO is a prime number.
  inverseFactorialValues[upperLimit] = calculateModularPower(factorialValues[upperLimit], ARITHMETIC_MODULO - 2);

  // Iteratively compute (i!)^(-1) from ( (i+1)! )^(-1) using the relation:
  // (i!)^(-1) = ( (i+1)! )^(-1) * (i+1) % ARITHMETIC_MODULO
  let currentInverseIndex = upperLimit;
  while (currentInverseIndex > 0 && !inverseFactorialValues[currentInverseIndex - 1]) {
    inverseFactorialValues[currentInverseIndex - 1] = chainModularMultiplication(inverseFactorialValues[currentInverseIndex], currentInverseIndex);
    currentInverseIndex--;
  }
}

/**
 * Calculates the number of combinations (nCr) modulo ARITHMETIC_MODULO.
 * The formula used is nCr = n! * (r!)^(-1) * ((n-r)!)^(-1) % ARITHMETIC_MODULO.
 *
 * @param {number} totalElements The total number of items from which to choose (n).
 * @param {number} chooseElements The number of items to choose (r).
 * @returns {number} The result of nCr % ARITHMETIC_MODULO.
 */
function calculateCombinationsModulo(totalElements, chooseElements) {
  // Guard clauses for invalid input values for combinations.
  if (chooseElements < 0 || chooseElements > totalElements) {
    return 0; // It's impossible to choose a negative number of items or more items than available.
  }
  // Base cases: There's one way to choose 0 items (choose none) or all items (choose all).
  if (chooseElements === 0 || chooseElements === totalElements) {
    return 1;
  }
  // Optimization: nCr = nC(n-r). Choosing the smaller 'r' reduces computation.
  if (chooseElements > totalElements / 2) {
    chooseElements = totalElements - chooseElements;
  }

  // Ensure inverse factorials are precomputed up to `totalElements` for the calculation.
  if (!inverseFactorialValues[totalElements]) {
    precomputeInverseFactorials(totalElements);
  }

  // Calculate nCr using the formula: n! * (r!)^-1 * ((n-r)!)^-1 % M
  return chainModularMultiplication(
    factorialValues[totalElements],
    inverseFactorialValues[chooseElements],
    inverseFactorialValues[totalElements - chooseElements]
  );
}

/**
 * Main function to solve the problem. It parses the input, iterates through possibilities,
 * calculates combinations, and sums them up modulo ARITHMETIC_MODULO.
 *
 * @param {string} rawInputString The input string containing space-separated numbers.
 */
function processInputAndSolve(rawInputString) {
  // Trim whitespace and parse the input string into an array of numbers.
  const numericParameters = rawInputString.trim().split(' ').map(Number);

  // Validate the number of expected input parameters.
  if (numericParameters.length < 4) {
    console.error("Error: Insufficient input parameters. Expected 4 numbers (n, a, b, k).");
    return;
  }

  // Assign more descriptive variable names to the parsed input values.
  const totalNumberOfItems = numericParameters[0]; // Represents 'n'
  const costOfFirstType = numericParameters[1];   // Represents 'a'
  const costOfSecondType = numericParameters[2];  // Represents 'b'
  const targetTotalCost = numericParameters[3];   // Represents 'k'

  // Additional validation for input values to ensure they are non-negative.
  if (totalNumberOfItems < 0 || costOfFirstType < 0 || costOfSecondType < 0 || targetTotalCost < 0) {
    console.error("Error: All input parameters (n, a, b, k) must be non-negative.");
    return;
  }

  // Edge case: If both costs are zero.
  if (costOfFirstType === 0 && costOfSecondType === 0) {
      if (targetTotalCost === 0) {
          // If costs are zero and target is zero, any combination of choosing items works.
          // For each of the `totalNumberOfItems`, we can either choose it as type A or type B.
          // This gives 2^n possibilities.
          console.log(calculateModularPower(2, totalNumberOfItems));
      } else {
          // If costs are zero but target is non-zero, it's impossible to reach.
          console.log(0);
      }
      return; // Exit early for this specific edge case.
  }

  let finalCumulativeAnswer = 0; // Accumulates the sum of valid combinations modulo ARITHMETIC_MODULO.

  // Iterate through all possible counts for the first type of item.
  // Let `firstItemCount` be the number of items chosen for type A.
  for (let firstItemCount = 0; firstItemCount <= totalNumberOfItems; ++firstItemCount) {
    const costIncurredByFirstType = firstItemCount * costOfFirstType;
    const remainingCostForSecondType = targetTotalCost - costIncurredByFirstType;

    // Optimization: If the remaining cost becomes negative, it means we've exceeded the target
    // with `firstItemCount` items, and increasing `firstItemCount` further will only make it more negative.
    // So, we can break out of the loop.
    if (remainingCostForSecondType < 0) {
      break;
    }

    // Check if the `remainingCostForSecondType` can be exactly covered by `costOfSecondType`.
    // This check also implicitly handles `costOfSecondType === 0` case:
    // if `costOfSecondType` is 0 and `remainingCostForSecondType` is not 0, then `remainingCostForSecondType % 0` is `NaN`,
    // causing `isSecondTypeCountExactlyDivisible` to be false, thus skipping the block.
    // If both are 0, `0 % 0` is `NaN`, also skipping. The `costOfFirstType === 0 && costOfSecondType === 0`
    // guard clause handles the true `0,0` case earlier.
    const isSecondTypeCountExactlyDivisible = (remainingCostForSecondType % costOfSecondType === 0);

    if (isSecondTypeCountExactlyDivisible) {
      const secondItemCount = remainingCostForSecondType / costOfSecondType;

      // Ensure the calculated count for the second item (`secondItemCount`) is within valid bounds.
      if (secondItemCount >= 0 && secondItemCount <= totalNumberOfItems) {
        // Calculate combinations for choosing `firstItemCount` items of type A.
        const combinationsForFirstType = calculateCombinationsModulo(totalNumberOfItems, firstItemCount);
        // Calculate combinations for choosing `secondItemCount` items of type B.
        const combinationsForSecondType = calculateCombinationsModulo(totalNumberOfItems, secondItemCount);

        // The contribution of the current (firstItemCount, secondItemCount) pair is their product.
        const currentTermProduct = chainModularMultiplication(combinationsForFirstType, combinationsForSecondType);
        // Add this product to the total, ensuring the sum is always kept modulo ARITHMETIC_MODULO.
        finalCumulativeAnswer = (finalCumulativeAnswer + currentTermProduct) % ARITHMETIC_MODULO;
      }
    }
  }

  // Output the final computed answer to the console.
  console.log(finalCumulativeAnswer);
}

// Entry point: Read input from standard input and execute the main processing function.
// In Node.js environments, '0' is often used as the file descriptor for standard input.
// Alternatively, '/dev/stdin' is a common path in Unix-like systems for standard input.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndSolve(standardInputData);