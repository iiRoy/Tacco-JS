// This script handles a specific combinatorial problem involving modular arithmetic.
// It includes functions for modular multiplication, modular exponentiation,
// and calculating binomial coefficients modulo a prime number.

function PrimaryProcess(dataSource) {
  // Begin by parsing the raw input string.
  // First, remove leading/trailing whitespace, then split into lines.
  // Each line is further split by spaces, resulting in a 2D array of strings.
  dataSource = dataSource.trim().split("\n").map(function(lineSegment) {
    return lineSegment.split(" ");
  });

  // Extract the primary numerical parameters from the first line of input.
  // These represent N, M, and K from the original problem context.
  var NumItems = parseInt(dataSource[0][0], 10);
  var ModBase = parseInt(dataSource[0][1], 10);
  var SelectCount = parseInt(dataSource[0][2], 10);

  // Define the large prime modulus and a split factor for modular arithmetic operations.
  var PrimeModulus = 998_244_353; // A common prime modulus in competitive programming.
  var SplitFactor = 100_000;      // Used to avoid overflow in modular multiplication.

  // Calculate a list of binomial coefficients C(NumItems - 1, i) for i from 0 to SelectCount.
  // The result is then reversed as required by the main calculation logic.
  var combinationsList = calcCombinationsMod(NumItems - 1, SelectCount, PrimeModulus, SplitFactor).reverse();

  // Initialize a temporary product term using modular exponentiation.
  // This calculates (ModBase - 1) raised to the power of (NumItems - SelectCount - 1), modulo PrimeModulus.
  var tempResult = modPower(ModBase - 1, NumItems - SelectCount - 1, PrimeModulus, SplitFactor);

  // Initialize the accumulator for the final aggregate sum.
  var finalResult = 0;

  // Iterate through each pre-calculated combination value.
  for (var currentCombo of combinationsList) {
    // Add the product of the current temporary result and the combination to the final result.
    finalResult += modMultiply(tempResult, currentCombo, PrimeModulus, SplitFactor);
    finalResult %= PrimeModulus; // Apply modulo to keep the sum within bounds.

    // Update the temporary result for the next iteration by multiplying it with (ModBase - 1).
    tempResult = modMultiply(tempResult, ModBase - 1, PrimeModulus, SplitFactor);
  }

  // Perform a final multiplication of the accumulated sum by ModBase.
  finalResult = modMultiply(finalResult, ModBase, PrimeModulus, SplitFactor);

  // Output the final computed answer to the console.
  console.log(finalResult);
}


function modMultiply(factorA, factorB, modVal, splitVal) {
  // This function performs modular multiplication (factorA * factorB) % modVal,
  // using a split value (splitVal) to handle potentially large intermediate products
  // that might exceed standard integer limits before the modulo operation.

  var quotientPart, remainderPart, productResult;

  // Split factorB into a quotient and remainder based on splitVal.
  // This helps break down the multiplication into smaller, manageable parts.
  quotientPart = (factorB / splitVal | 0); // Integer division for the quotient.
  remainderPart = factorB - (quotientPart * splitVal); // The remaining part.

  // Compute the product using the distributed property:
  // (A * (Q*S + R)) % M = ((A*Q*S)%M + (A*R)%M) % M
  // This ensures intermediate products (A*Q*S and A*R) are modulo M before summing.
  productResult = (factorA * quotientPart % modVal) * splitVal % modVal + (factorA * remainderPart);
  productResult %= modVal; // Apply final modulo to the sum.

  return productResult;
}


function calcCombinationsMod(maxIndex, maxK, currentMod, splitConstant) {
  // This routine calculates C(N, k) modulo a prime number, for k ranging from 0 up to maxK.
  // It returns an array containing [C(maxIndex, 0), C(maxIndex, 1), ..., C(maxIndex, maxK)].
  // Pre-computation of factorials and their modular inverses is used for efficiency.

  var comboResults = []; // Array to store the calculated C(N, k) values.
  var factorials, invFactorials, inverses;

  // Initialize arrays for factorials, inverse factorials, and modular inverses.
  // Base cases for 0! and 1!.
  factorials = [1, 1];
  invFactorials = [1, 1];
  inverses = [0, 1];

  // Pre-computation loop: calculate factorials, inverse factorials, and inverses up to maxIndex.
  for (var idx = 2; idx <= maxIndex; idx++) {
    // Calculate factorial: idx! = (idx-1)! * idx (mod currentMod).
    factorials.push(factorials[idx - 1] * idx % currentMod);

    // Calculate modular inverse of idx using the property:
    // inv[idx] = currentMod - (inv[currentMod % idx] * (currentMod / idx | 0)) % currentMod.
    // This is efficient for prime moduli.
    inverses.push(currentMod - modMultiply(inverses[currentMod % idx], (currentMod / idx | 0), currentMod, splitConstant) % currentMod);

    // Calculate inverse factorial: (idx!)^(-1) = ((idx-1)!)^(-1) * (idx)^(-1) (mod currentMod).
    invFactorials.push(modMultiply(invFactorials[idx - 1], inverses[idx], currentMod, splitConstant));
  }

  // Calculate binomial coefficients C(maxIndex, idx) for each idx from 0 to maxK.
  // C(N, K) = N! * (K!)^(-1) * ((N-K)!)^(-1) (mod M).
  for (var idx = 0; idx <= maxK; idx++) {
    // First part: N! * ((N-K)!)^(-1)
    var term1 = modMultiply(factorials[maxIndex], invFactorials[maxIndex - idx], currentMod, splitConstant);
    // Second part: (N! * ((N-K)!)^(-1)) * (K!)^(-1)
    var term2 = modMultiply(term1, invFactorials[idx], currentMod, splitConstant);
    comboResults.push(term2);
  }

  return comboResults;
}


function modPower(baseVal, exponentVal, powerMod, splitNum) {
  // This function computes (baseVal ^ exponentVal) % powerMod using the
  // method of binary exponentiation (also known as exponentiation by squaring).
  // This is significantly faster than naive repeated multiplication for large exponents.

  var powerResult = 1; // Initialize the result to 1 (any number to the power of 0 is 1).
  var binaryExponent = exponentVal.toString(2); // Convert the exponent to its binary representation.
  var exponentLength = binaryExponent.length;
  var currentBase = baseVal; // A temporary variable to hold the increasing powers of the base.

  // Iterate through the bits of the binary exponent from right to left.
  // The loop processes bits from the least significant to the most significant.
  for (var bitIndex = 0; bitIndex < exponentLength; bitIndex++) {
    // Check if the current bit is '1'. The (bitIndex + 1) * -1 correctly accesses bits from the end.
    if (binaryExponent.substr((bitIndex + 1) * -1, 1) === '1') {
      // If the bit is '1', it means this power of 2 contributes to the exponent.
      // Multiply the accumulated result by the current power of the base.
      powerResult = modMultiply(powerResult, currentBase, powerMod, splitNum);
    }
    // Square the current base for the next bit position.
    // This prepares `currentBase` for the next higher power of 2.
    currentBase = modMultiply(currentBase, currentBase, powerMod, splitNum);
  }
  return powerResult;
}

// The entry point of the script: read input from standard input and pass it to the primary function.
PrimaryProcess(require("fs").readFileSync("/dev/stdin", "utf8"));