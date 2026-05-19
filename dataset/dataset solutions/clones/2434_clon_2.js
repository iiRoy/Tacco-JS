function ProcessInput(rawData) {
  // Process the raw input string: trim whitespace, split by newlines,
  // then map each line to an array of strings split by spaces.
  let processedData = rawData.trim().split("\n").map(function(lineSegment) {
    return lineSegment.split(" ");
  });

  // Define a large prime modulus for calculations.
  const MODULUS_VAL = 1000000007; // Equivalent to 1e+9 + 7
  // Define a constant used for splitting numbers in modular multiplication.
  const SPLIT_POINT = 100000; // Equivalent to 1e+5

  // Parse the first two numbers from the first line of input.
  // These represent coordinates or counts.
  let firstCoord = parseInt(processedData[0][0], 0xA); // Using hexadecimal literal for 10
  let secondCoord = parseInt(processedData[0][1], 10); // Standard decimal parsing

  // Initialize the variable to store the final computed result.
  let finalResult = 0;

  // Calculate 'n' based on the sum of coordinates.
  // This represents the total number of steps in a grid path problem.
  let totalSteps = (firstCoord + secondCoord) / 3;

  // Calculate 'r' and 'r2' which represent specific step counts
  // (e.g., steps to the right and steps up) in a grid path.
  let stepsRight = (4 * firstCoord - 2 * secondCoord) / 6;
  let stepsUp = (4 * secondCoord - 2 * firstCoord) / 6;

  // Check if the calculated step counts are valid (non-negative and integer).
  // If valid, proceed with combination calculation.
  if (stepsRight >= 0 && stepsUp >= 0 && Number.isInteger(stepsRight)) {
    // Call the modular combination function.
    // The '1' indicates we only need nCr for the current n and r.
    let intermediateCalc = calculateCombinationsModulo(totalSteps, stepsRight, 1, MODULUS_VAL, SPLIT_POINT);
    // The result is the first element of the returned array.
    finalResult = intermediateCalc[0];
  }

  // Output the final computed answer to the console.
  console.log(finalResult);
}

/**
 * Performs modular multiplication (a * b) % modVal efficiently,
 * especially for large 'b' values, by splitting 'b'.
 * @param {number} factorA - The first operand.
 * @param {number} factorB - The second operand.
 * @param {number} modVal - The modulus.
 * @param {number} splitVal - The value to split factorB by (e.g., 1e5).
 * @returns {number} The result of (factorA * factorB) % modVal.
 */
function multiplyModulo(factorA, factorB, modVal, splitVal) {
  let quotientPart, remainderPart, productResult;

  // Split factorB into a quotient and a remainder based on splitVal.
  quotientPart = (factorB / splitVal) | 0; // Integer division
  remainderPart = factorB - (quotientPart * splitVal);

  // Perform modular multiplication using the split parts.
  // This helps prevent intermediate products from overflowing standard number types
  // before the modulo operation, especially when modVal is large.
  productResult = (factorA * quotientPart % modVal) * splitVal % modVal + (factorA * remainderPart);
  productResult %= modVal; // Apply final modulo.

  return productResult;
}

/**
 * Calculates nCr (n choose r) modulo a prime number, and potentially n+i C r+i for i up to maxIterations-1.
 * It precomputes factorials, inverse factorials, and modular inverses.
 * @param {number} totalItems - The 'n' in nCr.
 * @param {number} itemsChosen - The 'r' in nCr.
 * @param {number} maxIterations - The number of combinations to calculate (e.g., 1 for just nCr).
 * @param {number} moduloValue - The modulus for all calculations.
 * @param {number} splitConstant - A constant used in the modular multiplication helper.
 * @returns {number[]} An array containing the calculated combinations modulo moduloValue.
 */
function calculateCombinationsModulo(totalItems, itemsChosen, maxIterations, moduloValue, splitConstant) {
  // Array to store the results of nCr, (n+1)C(r+1), etc.
  let combinationResults = [];

  // Arrays for precomputing factorials, inverse factorials, and modular inverses.
  let factorials, inverseFactorials, modularInverses;

  // Initialize base cases for factorials and their inverses.
  factorials = [1, 1];
  inverseFactorials = [1, 1];
  modularInverses = [0, 1];

  // Precompute values up to totalItems + maxIterations - 1.
  // This range covers all 'n+i' values needed for the combinations.
  for (let loopCounter = 2; loopCounter < maxIterations + totalItems; loopCounter++) {
    // Calculate factorial: fac[i] = (fac[i-1] * i) % MOD
    factorials.push(factorials[loopCounter - 1] * loopCounter % moduloValue);

    // Calculate modular inverse: inv[i] = MOD - (inv[MOD % i] * (MOD / i)) % MOD
    // This uses Fermat's Little Theorem for prime moduli.
    modularInverses.push(moduloValue - multiplyModulo(modularInverses[moduloValue % loopCounter], (moduloValue / loopCounter | 0), moduloValue, splitConstant) % moduloValue);

    // Calculate inverse factorial: finv[i] = (finv[i-1] * inv[i]) % MOD
    inverseFactorials.push(multiplyModulo(inverseFactorials[loopCounter - 1], modularInverses[loopCounter], moduloValue, splitConstant));
  }

  // Handle edge cases where combinations are not possible.
  if (totalItems < itemsChosen) return 0;
  if (totalItems < 0 || itemsChosen < 0) return 0;

  // Calculate nCr, (n+1)C(r+1), ..., (n+MAX-1)C(r+MAX-1)
  // nCr = fac[n] * finv[r] * finv[n-r] % MOD
  for (let loopCounter = 0; loopCounter < maxIterations; loopCounter++) {
    let currentN = totalItems + loopCounter;
    let currentR = itemsChosen + loopCounter;

    // Calculate (fac[currentN] * finv[currentR]) % MOD
    let term1 = multiplyModulo(factorials[currentN], inverseFactorials[currentR], moduloValue, splitConstant);
    // Calculate (term1 * finv[currentN - currentR]) % MOD
    let finalTerm = multiplyModulo(term1, inverseFactorials[currentN - currentR], moduloValue, splitConstant);

    combinationResults.push(finalTerm);
  }

  return combinationResults;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
