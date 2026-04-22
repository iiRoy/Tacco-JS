/*
 * This file contains a solution to a combinatorial problem
 * involving modular arithmetic.
 */
function ProcessInputData(incomingData) {
  // Split the raw input string by newlines to get individual lines.
  incomingData = incomingData.split("\n");

  // Define the large prime modulus for all calculations.
  const modulusConst = 998244353n;

  // Parse problem parameters from the first line of input.
  // The parameters are N, M, and K, converted to BigInt.
  const firstLineParts = incomingData[0].split(" ");
  const countItems = BigInt(parseInt(firstLineParts[0]));
  const numChoices = BigInt(parseInt(firstLineParts[1]));
  const maxSelections = BigInt(parseInt(firstLineParts[2]));

  // Initialize a dynamic programming cache (though not fully utilized in this specific logic).
  let dynamicCache = new Array(maxSelections + 1n).fill(0n);
  dynamicCache[0] = numChoices; // Set the initial value for the base case.

  // Initialize the variable to store the final accumulated sum.
  let cumulativeSum = 0n;

  // Initialize an intermediate multiplier value.
  let currentMultiplier = numChoices - 1n;

  // Perform a pre-calculation loop if certain conditions are met.
  // This loop adjusts the intermediate multiplier.
  if (countItems - 2n - maxSelections >= 1n) {
    for (let loopVar = 0; loopVar < countItems - 2n - maxSelections; loopVar++) {
      currentMultiplier = (currentMultiplier * (numChoices - 1n)) % modulusConst;
    }
  }

  // Ensure the intermediate multiplier is at least 1 if it somehow became 0.
  if (currentMultiplier === 0n) {
    currentMultiplier = 1n;
  }

  // Main loop to calculate the final sum based on combinations.
  // Iterates from K down to 0.
  for (let idx = maxSelections; idx >= 0n; idx--) {
    // Accumulate the result using modular arithmetic for each term.
    cumulativeSum = (cumulativeSum + (((computeCombinations(countItems - 1n, idx)) % modulusConst * numChoices) % modulusConst * currentMultiplier) % modulusConst) % modulusConst;
    // Update the multiplier for the next iteration.
    currentMultiplier = (currentMultiplier * (numChoices - 1n)) % modulusConst;
  }


  // Helper function to calculate the product of a range of numbers modulo a constant.
  function calculateProductModulo(startVal, endVal) {
    let currentProduct = startVal;
    let counter = startVal;

    while (counter++ < endVal) {
      currentProduct = (currentProduct * counter) % modulusConst;
    }
    return currentProduct;
  }


  // Function to compute combinations (nCr) modulo a prime.
  function computeCombinations(totalElements, numToChoose) {
    // Base cases for combinations.
    if (totalElements === numToChoose || numToChoose === 0n) {
      return 1n;
    } else {
      // Optimization: C(n, r) = C(n, n-r)
      numToChoose = (numToChoose < totalElements - numToChoose) ? totalElements - numToChoose : numToChoose;
      // Calculate modular inverse for the denominator.
      let inverseTerm = modularInverse(calculateProductModulo(1n, totalElements - numToChoose), modulusConst);
      // Return the result (numerator * inverse of denominator) mod modulusConst.
      return (calculateProductModulo(numToChoose + 1n, totalElements) * inverseTerm) % modulusConst;
    }
  }

  // Utility function for modular exponentiation (a^n % mod).
  function powerMod(baseValue, exponentValue, currentModulus) {
    let calculatedResult = 1n; // Initialize result
    // Loop while exponent is greater than zero
    while (exponentValue > 0) {
      // If exponent is odd, multiply base with result
      if (exponentValue & 1n) calculatedResult = calculatedResult * baseValue % currentModulus;
      // Square the base
      baseValue = baseValue * baseValue % currentModulus;
      // Right shift exponent by 1 (divide by 2)
      exponentValue >>= 1n;
    }
    return calculatedResult;
  }

  // Function to compute modular multiplicative inverse using Fermat's Little Theorem.
  // Requires modulus to be prime. inv(a) = a^(mod-2) % mod.
  function modularInverse(numberToInvert, modulusForInverse) {
    return powerMod(numberToInvert, modulusForInverse - 2n, modulusForInverse);
  }

  // Output the final computed answer to the console.
  console.log('%s', cumulativeSum.toString());
  // Return the calculated answer.
  return cumulativeSum;
}

/*
 * Helper function for debugging and testing purposes.
 * It fetches input from a specific HTML element, runs the main logic,
 * and displays "AC" or "WA" based on the comparison with an expected output.
 */
function validateTest(testIndex) {
  let testInputString = document.getElementById("input" + testIndex).value;
  let calculatedAnswer = ProcessInputData(testInputString);
  let testVerdict = "WA"; // Assume Wrong Answer initially.
  // Compare the calculated answer with the expected output.
  if (calculatedAnswer === BigInt(document.getElementById("output" + testIndex).value.split("\n")[0])) {
    testVerdict = "AC"; // Set to Accepted if they match.
  }
  // Update the result display in the HTML.
  document.getElementById("result" + testIndex).innerHTML = testVerdict;
}

// Execute the main function with input read from stdin when running in a Node.js environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));