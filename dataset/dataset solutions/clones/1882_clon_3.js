function processInput(rawData) {
  // Split the raw input into individual lines for processing.
  const processedLines = rawData.split('\n');

  // Define the large prime modulus for all calculations.
  const primeModulus = 998244353n;

  // Parse the first line of input to extract N, M, and K.
  const lineOneParts = processedLines[0].split(' ');
  const totalCount = BigInt(parseInt(lineOneParts[0])); // Represents 'N'
  const baseVal = BigInt(parseInt(lineOneParts[1]));    // Represents 'M'
  const maxIterCount = BigInt(parseInt(lineOneParts[2])); // Represents 'K'

  // Initialize the accumulator for the final result.
  let finalOutcome = 0n;

  // Initialize a multiplier that changes iteratively.
  // This corresponds to (M-1)^(N-2-K) initially, then (M-1) in each step of the main loop.
  let iterativeMultiplier = baseVal - 1n;

  // Calculate the initial power of (M-1) based on N, M, K.
  // This corresponds to the (N-2-K) exponent.
  const exponentForMultiplier = totalCount - 2n - maxIterCount;

  // If the exponent is positive, apply the power.
  if (exponentForMultiplier >= 1n) {
    let loopCounter = 0n;
    while (loopCounter < exponentForMultiplier) {
      iterativeMultiplier = (iterativeMultiplier * (baseVal - 1n)) % primeModulus;
      loopCounter++;
    }
  }

  // Edge case handling: If the multiplier somehow became zero, reset it to 1.
  // This typically happens if baseVal was 1, making (baseVal - 1n) zero.
  if (iterativeMultiplier === 0n) {
    iterativeMultiplier = 1n;
  }

  // Main loop to sum up terms for the final result.
  // It iterates downwards from maxIterCount (K) to 0.
  let currentIteration = maxIterCount;
  while (currentIteration >= 0n) {
    // Calculate combinations (N-1 choose currentIteration)
    const combinationsTerm = calculateCombinations(totalCount - 1n, currentIteration);

    // Multiply by baseVal (M)
    const productWithBase = (combinationsTerm * baseVal) % primeModulus;

    // Multiply by the current iterativeMultiplier (x)
    const termForSum = (productWithBase * iterativeMultiplier) % primeModulus;

    // Add to the final outcome, ensuring it stays within the modulus.
    finalOutcome = (finalOutcome + termForSum) % primeModulus;

    // Update the iterativeMultiplier for the next step: x = x * (M-1) % mod
    iterativeMultiplier = (iterativeMultiplier * (baseVal - 1n)) % primeModulus;

    // Decrement the iteration counter.
    currentIteration--;
  }

  /**
   * Computes the product of a range of numbers [startVal, endVal] modulo primeModulus.
   * This is used for factorial-like calculations in combinations.
   * @param {BigInt} startVal - The starting value of the range (inclusive).
   * @param {BigInt} endVal - The ending value of the range (inclusive).
   * @returns {BigInt} The product modulo primeModulus.
   */
  function computeProductRange(startVal, endVal) {
    // If the range is empty (e.g., product from 1 to 0), the product is 1.
    if (startVal > endVal) {
      return 1n;
    }
    let currentProduct = startVal;
    let iterationTracker = startVal;

    // Multiply from (startVal + 1) up to endVal.
    while (iterationTracker < endVal) {
      iterationTracker++; // Increment before multiplication
      currentProduct = (currentProduct * iterationTracker) % primeModulus;
    }
    return currentProduct;
  }

  /**
   * Calculates "n choose r" (combinations) modulo primeModulus.
   * C(n, r) = n! / (r! * (n-r)!)
   * @param {BigInt} totalItems - The total number of items (n).
   * @param {BigInt} chosenItems - The number of items to choose (r).
   * @returns {BigInt} The number of combinations modulo primeModulus.
   */
  function calculateCombinations(totalItems, chosenItems) {
    // Handle invalid input for combinations.
    if (chosenItems < 0n || chosenItems > totalItems) {
      return 0n; // Cannot choose a negative number or more items than available.
    }
    // C(n, 0) = 1 and C(n, n) = 1
    if (chosenItems === 0n || chosenItems === totalItems) {
      return 1n;
    }
    // Optimization: C(n, r) = C(n, n-r), so choose the smaller r for fewer multiplications.
    const effectiveChosenItems = (chosenItems < totalItems - chosenItems) ? chosenItems : (totalItems - chosenItems);

    // Calculate the numerator part: P(n, r) = n * (n-1) * ... * (n-r+1)
    // This is equivalent to product_Range(totalItems - effectiveChosenItems + 1n, totalItems)
    const numerator = computeProductRange(totalItems - effectiveChosenItems + 1n, totalItems);

    // Calculate the denominator part: r!
    const denominator = computeProductRange(1n, effectiveChosenItems);

    // Calculate the modular inverse of the denominator.
    const denominatorInverse = modularInverse(denominator);

    // Result is (numerator * denominatorInverse) % primeModulus
    return (numerator * denominatorInverse) % primeModulus;
  }

  /**
   * Computes (base ^ exponent) % modulus using binary exponentiation (exponentiation by squaring).
   * @param {BigInt} baseVal - The base.
   * @param {BigInt} exponentVal - The exponent.
   * @param {BigInt} modulusVal - The modulus.
   * @returns {BigInt} (base ^ exponent) % modulus.
   */
  function modularExponentiation(baseVal, exponentVal, modulusVal) {
    let resultAccumulator = 1n;
    let currentBase = baseVal % modulusVal; // Ensure base is within modulus initially

    // Iterate while the exponent is greater than zero.
    while (exponentVal > 0n) {
      // If the current bit of the exponent is 1 (i.e., exponent is odd).
      if ((exponentVal & 1n) !== 0n) {
        resultAccumulator = (resultAccumulator * currentBase) % modulusVal;
      }
      // Square the base and halve the exponent.
      currentBase = (currentBase * currentBase) % modulusVal;
      exponentVal >>= 1n; // Equivalent to exponentVal = exponentVal / 2n
    }
    return resultAccumulator;
  }

  /**
   * Computes the modular multiplicative inverse of a number 'valueToInvert' modulo 'primeModulus'.
   * Uses Fermat's Little Theorem: a^(p-2) % p is the inverse of a % p for prime p.
   * @param {BigInt} valueToInvert - The number to find the inverse of.
   * @returns {BigInt} The modular inverse.
   */
  function modularInverse(valueToInvert) {
    // For Fermat's Little Theorem, the modulus must be prime.
    // primeModulus - 2n is the exponent for the modular exponentiation.
    return modularExponentiation(valueToInvert, primeModulus - 2n, primeModulus);
  }

  // Output the final calculated result.
  console.log(finalOutcome.toString());
  return finalOutcome;
}

/**
 * A utility function for testing scenarios in a browser environment.
 * It fetches input from a textarea, runs the main logic, and displays the result.
 * @param {number} scenarioIndex - The index of the test scenario.
 */
function testScenario(scenarioIndex) {
  // Get input and expected output elements by their IDs.
  const inputElement = document.getElementById("input" + scenarioIndex);
  const outputElement = document.getElementById("output" + scenarioIndex);
  const resultDisplay = document.getElementById("result" + scenarioIndex);

  // Retrieve the input string from the textarea.
  const scenarioInput = inputElement.value;

  // Execute the main calculation function with the scenario input.
  const computedAnswer = processInput(scenarioInput);

  // Initialize comparison status.
  let comparisonStatus = "WA"; // "Wrong Answer" by default.

  // Compare the computed answer with the expected output.
  // Note: Expected output is typically just the first line.
  if (computedAnswer.toString() === outputElement.value.split("\n")[0]) {
    comparisonStatus = "AC"; // "Accepted" if they match.
  }

  // Update the result display element.
  resultDisplay.innerHTML = comparisonStatus;
}

// Entry point for execution in a Node.js environment.
// Reads input from standard input and passes it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));