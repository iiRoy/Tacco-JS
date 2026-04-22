function calculateResult(rawInput) {
  // This is a helper function to sum numeric elements in an array.
  const totalElements = function(dataArray) {
    let currentTotal = 0;
    dataArray.forEach(function(item) {
      currentTotal += item;
    });
    return currentTotal;
  };

  // Define crucial constants used for modular arithmetic.
  const primeModulus = 1e9 + 7;
  const chunkDivisor = 1e5;

  // Pre-process the raw input string: trim, split by lines, then split each line by spaces.
  rawInput = rawInput.trim().split("\n").map(function(line) { return line.split(" "); });

  // Parse the main numeric parameters from the first line of input.
  const countItems = parseInt(rawInput[0][0], 10);
  const maxIterations = parseInt(rawInput[0][1], 10);

  // Initialize an array to store the results of modular exponentiations.
  const powerSeries = Array.from({ length: Math.ceil(maxIterations) }, () => 0);
  let intermediateValue;

  // Begin the first primary loop to populate the powerSeries array.
  for (let idx = 1; idx <= maxIterations; idx++) {
    intermediateValue = (maxIterations / idx | 0); // Perform integer division.
    idx = (maxIterations / intermediateValue | 0); // Re-adjust the loop counter using the intermediate value.
    // Calculate and store the modular exponentiation result.
    powerSeries[idx - 1] = modularExponentiation(idx, countItems, primeModulus, chunkDivisor);
  }

  // Initialize an array to store pattern frequencies and the final accumulated answer.
  const frequencyArray = Array.from({ length: maxIterations }, () => 0);
  let currentUpper;
  let accumulatedAnswer = 0;

  // Start the second main loop, iterating in reverse order.
  for (let valX = maxIterations; valX >= 1; valX--) {
    currentUpper = (maxIterations / valX | 0); // Determine the upper bound for the nested loop.
    intermediateValue = powerSeries[currentUpper - 1]; // Retrieve a pre-calculated value.

    // Inner loop: Adjust the intermediate value based on previously computed frequencies.
    for (let subJ = 2; subJ <= currentUpper; subJ++) {
      intermediateValue -= frequencyArray[valX * subJ - 1];
    }

    // Ensure the intermediate result is positive after modulo operation.
    intermediateValue = positiveModulo(intermediateValue, primeModulus);
    
    // Accumulate the product of valX and the processed intermediate value.
    accumulatedAnswer += modularProduct(valX, intermediateValue, primeModulus, chunkDivisor);
    
    // Keep the accumulated answer within the bounds of the prime modulus.
    accumulatedAnswer %= primeModulus;
    
    // Store the calculated intermediate value for future iterations.
    frequencyArray[valX - 1] = intermediateValue;
  }

  // Output the final computed result to the console.
  console.log(accumulatedAnswer);
}

// This function computes (factorA * factorB) % modVal efficiently,
// especially useful when factorB might be large.
function modularProduct(factorA, factorB, modVal, splitVal) {
  let quotientPart, remainderPart, productResult;

  // Split factorB into a quotient and remainder based on splitVal.
  quotientPart = (factorB / splitVal | 0);
  remainderPart = factorB - (quotientPart * splitVal);

  // Calculate the modular product using the split parts, preventing overflow.
  productResult = (factorA * quotientPart % modVal) * splitVal % modVal + (factorA * remainderPart);
  
  // Ensure the final product is within the modulo range.
  productResult %= modVal;
  return productResult;
}

// Implements modular exponentiation (baseVal^exponentVal % modVal) using binary exponentiation.
function modularExponentiation(baseVal, exponentVal, modVal, splitVal) {
  let currentResult = 1; // Initialize the result to 1.
  const exponentString = exponentVal.toString(2); // Convert the exponent to its binary string representation.
  const stringLen = exponentString.length; // Get the length of the binary string.
  let iteratedBase = baseVal; // Initialize the base that will be squared in each iteration.

  // Iterate through the bits of the binary exponent from right to left.
  for (let bitIdx = 0; bitIdx < stringLen; bitIdx++) {
    // If the current bit is '1', multiply the currentResult by the iteratedBase.
    if (exponentString.substr((bitIdx + 1) * -1, 1) === '1') {
      currentResult = modularProduct(currentResult, iteratedBase, modVal, splitVal);
    }
    // Square the iteratedBase for the next bit, applying modulo.
    iteratedBase = modularProduct(iteratedBase, iteratedBase, modVal, splitVal);
  }
  return currentResult;
}

// Provides a modulo operation that always returns a non-negative result,
// even if the input valueA is negative.
function positiveModulo(valueA, valueB) {
  return (valueA % valueB < 0) ? (valueA % valueB + 0 + (valueB < 0 ? -valueB : valueB)) : (valueA % valueB + 0);
}

// Execute the main calculation logic by reading input from standard input.
calculateResult(require("fs").readFileSync("/dev/stdin", "utf8"));