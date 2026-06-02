/**
 * Processes the input string to calculate a specific value based on N, M, and K.
 * This function implements a modular arithmetic calculation involving combinations.
 * @param {string} rawData - The input string containing N, M, and K on the first line.
 * @returns {bigint} The calculated final result modulo primeModulus.
 */
function ProcessInput(rawData) {
  // Split the input string by newlines to handle multiple lines, though only the first is used.
  rawData = rawData.split("\n");

  // Define the prime modulus for all calculations.
  const primeModulus = 998244353n;

  // Parse N, M, and K from the first line of input.
  // The values are converted to BigInts for arbitrary precision arithmetic.
  const inputParts = rawData[0].split(" ");
  const countN = BigInt(parseInt(inputParts[0]));
  const valueM = BigInt(parseInt(inputParts[1]));
  const limitK = BigInt(parseInt(inputParts[2]));

  // Initialize a dynamic programming cache (though it remains unused in this specific algorithm path).
  const dynamicCache = new Array(limitK + 1n).fill(0n);
  dynamicCache[0] = valueM; // Set the first element, as per original structure.

  // Initialize the accumulator for the final result.
  let finalResult = 0n;

  // Initialize a factor 'currentFactor' which will be updated in loops.
  let currentFactor = valueM - 1n;

  // First conditional loop to update 'currentFactor'.
  // This loop runs if N - 2 - K is at least 1.
  if (countN - 2n - limitK >= 1n) {
    // Iterate a specific number of times.
    for (let loopVar = 0; loopVar < countN - 2n - limitK; loopVar++) {
      // Multiply currentFactor by (M-1) modulo primeModulus.
      currentFactor = (currentFactor * (valueM - 1n)) % primeModulus;
    }
  }

  // If currentFactor becomes zero after the first loop, reset it to 1.
  // This handles cases where (M-1) might be 0, preventing zero multiplication issues.
  if (currentFactor === 0n) {
    currentFactor = 1n;
  }

  // Main loop to calculate the final result.
  // Iterates from limitK down to 0.
  for (let loopVar = limitK; loopVar >= 0n; loopVar--) {
    // Calculate a term for the sum: (combinations(N-1, loopVar) * M * currentFactor) % primeModulus.
    const termPart1 = computeCombinations(countN - 1n, loopVar);
    const termPart2 = (termPart1 * valueM) % primeModulus;
    const termPart3 = (termPart2 * currentFactor) % primeModulus;

    // Add the calculated term to the final result, modulo primeModulus.
    finalResult = (finalResult + termPart3) % primeModulus;

    // Update currentFactor for the next iteration.
    currentFactor = (currentFactor * (valueM - 1n)) % primeModulus;
  }

  /**
   * Calculates the product of a range of numbers (startVal * (startVal+1) * ... * endVal) modulo primeModulus.
   * @param {bigint} startVal - The starting value of the range (inclusive).
   * @param {bigint} endVal - The ending value of the range (inclusive).
   * @returns {bigint} The product modulo primeModulus.
   */
  function calculateProductRange(startVal, endVal) {
    let productAccumulator = startVal;
    let currentIter = startVal; // Initialize iterator for the loop.

    // Loop while the current iterator (before increment) is less than endVal.
    while (currentIter++ < endVal) {
      // Multiply the accumulator by the incremented iterator, modulo primeModulus.
      productAccumulator = (productAccumulator * currentIter) % primeModulus;
    }
    return productAccumulator;
  }

  /**
   * Computes the number of combinations (nCr) modulo primeModulus.
   * Uses the formula nCr = n! / (r! * (n-r)!) and modular inverse for division.
   * @param {bigint} totalItems - The total number of items (n).
   * @param {bigint} chosenItems - The number of items to choose (r).
   * @returns {bigint} The number of combinations modulo primeModulus.
   */
  function computeCombinations(totalItems, chosenItems) {
    // Base cases for combinations: nCn = 1 and nC0 = 1.
    if (totalItems === chosenItems || chosenItems === 0n) {
      return 1n;
    } else {
      // Optimization: nCr = nC(n-r). Choose the larger of r and n-r to minimize multiplications.
      // This ensures that 'chosenItems' is always the larger value for the product_Range(chosenItems+1, totalItems) part.
      chosenItems = (chosenItems < totalItems - chosenItems) ? totalItems - chosenItems : chosenItems;

      // Calculate the modular inverse of (totalItems - chosenItems)!
      // This corresponds to 1 / ((n-r)!) in the nCr formula.
      const modularInverse = getModularInverse(calculateProductRange(1n, totalItems - chosenItems), primeModulus);

      // Calculate (totalItems * (totalItems-1) * ... * (chosenItems+1)) modulo primeModulus.
      // Then multiply by the modular inverse.
      return (calculateProductRange(chosenItems + 1n, totalItems) * modularInverse) % primeModulus;
    }
  }

  /**
   * Calculates (base^exponent) % modulus using modular exponentiation (binary exponentiation).
   * @param {bigint} base - The base number.
   * @param {bigint} exponent - The exponent.
   * @param {bigint} modulus - The modulus.
   * @returns {bigint} The result of (base^exponent) % modulus.
   */
  function powerModulo(base, exponent, modulus) {
    let resultPower = 1n; // Initialize result to 1.
    // Loop while exponent is greater than 0.
    while (exponent > 0) {
      // If the current bit of the exponent is 1 (exponent is odd).
      if (exponent & 1n) {
        resultPower = (resultPower * base) % modulus;
      }
      // Square the base and take modulo.
      base = (base * base) % modulus;
      // Right shift the exponent by 1 (equivalent to dividing by 2).
      exponent >>= 1n;
    }
    return resultPower;
  }

  /**
   * Calculates the modular multiplicative inverse of 'num' modulo 'modulus'.
   * Uses Fermat's Little Theorem: a^(p-2) % p is the inverse of a % p for prime p.
   * @param {bigint} num - The number for which to find the inverse.
   * @param {bigint} modulus - The prime modulus.
   * @returns {bigint} The modular inverse of 'num'.
   */
  function getModularInverse(num, modulus) {
    return powerModulo(num, modulus - 2n, modulus);
  }

  // Output the final result to the console.
  console.log('%s', finalResult.toString());

  // Return the final calculated BigInt value.
  return finalResult;
}

/**
 * A testing utility function, likely for a web-based environment.
 * It reads input from a DOM element, calls the main processing function,
 * and displays the result (AC/WA) in another DOM element.
 * @param {number} testCaseNumber - The identifier for the input/output elements.
 */
function testFunction(testCaseNumber) {
  // Retrieve input from a specific DOM element.
  const testInput = document.getElementById("input" + testCaseNumber).value;
  // Call the main processing function with the retrieved input.
  const calculatedAnswer = ProcessInput(testInput);

  let testOutcome = "WA"; // Default outcome is "Wrong Answer".

  // Retrieve the expected output from another DOM element.
  const expectedOutput = document.getElementById("output" + testCaseNumber).value.split("\n")[0];

  // Compare the calculated answer (BigInt) with the expected output (string, converted to BigInt).
  // Note: The original code used '==', which performs type coercion. Explicit BigInt conversion ensures clarity.
  if (calculatedAnswer === BigInt(expectedOutput)) {
    testOutcome = "AC"; // If they match, set outcome to "Accepted".
  }

  // Update the inner HTML of a result element with the test outcome.
  document.getElementById("result" + testCaseNumber).innerHTML = testOutcome;
}

// Execute the main processing function by reading input from standard input.
// This line is typical for competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
