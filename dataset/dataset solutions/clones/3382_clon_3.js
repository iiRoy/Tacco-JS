// Function responsible for orchestrating the computation based on provided input data.
function ComputeSolutionFromInput(inputStringData) {
  // --- Input Parsing and Validation ---
  // A robust check for input validity at the very beginning.
  if (typeof inputStringData !== 'string' || inputStringData.trim().length === 0) {
    throw new Error("Input data is either missing or not a valid string.");
  }

  // Split the input into individual lines and extract relevant parameters.
  const dataLines = inputStringData.trim().split("\n");
  if (dataLines.length === 0) {
    throw new Error("No data lines found in the input string.");
  }

  const parameters = dataLines[0].split(" ").map(Number); // Convert strings to numbers directly
  if (parameters.length < 2 || parameters.some(isNaN)) {
    throw new Error("Failed to parse numeric parameters from the first input line.");
  }

  // Assign parsed values to descriptive variables.
  const requiredDivisor = parameters[0]; // Represents the 'N' from the original problem.
  let numberToDecompose = parameters[1]; // Represents the 'P' from the original problem, mutable.

  // Additional validation for the input values.
  if (requiredDivisor <= 0 || !Number.isInteger(requiredDivisor)) {
    throw new Error("The required divisor must be a positive integer.");
  }
  if (numberToDecompose <= 0 || !Number.isInteger(numberToDecompose)) {
    throw new Error("The number to decompose must be a positive integer.");
  }

  // --- Prime Factorization Logic ---
  // Early exit for the trivial case where the number is 1.
  if (numberToDecompose === 1) {
    return 1; // Any power of 1 is 1, and 1 has no prime factors.
  }

  // This array will store objects, each representing a prime factor and its total count.
  const discoveredPrimeFactors = []; // Equivalent to the 'A' array in the original code.

  // Optimize factorization by handling the prime 2 separately.
  // This is a common optimization and structural change.
  if (numberToDecompose % 2 === 0) {
    let countOfTwo = 0;
    while (numberToDecompose % 2 === 0) {
      countOfTwo++;
      numberToDecompose /= 2;
    }
    discoveredPrimeFactors.push({ prime: 2, count: countOfTwo });
  }

  // Iterate through odd numbers as potential prime factors.
  // The loop condition is optimized: we only need to check up to the square root of the remaining number.
  let currentTestFactor = 3; // Equivalent to 'i' in the original code.
  while (currentTestFactor * currentTestFactor <= numberToDecompose) {
    if (numberToDecompose % currentTestFactor === 0) {
      // If currentTestFactor divides numberToDecompose, count its occurrences.
      let factorOccurrences = 0; // Equivalent to 'k' in the original code.
      while (numberToDecompose % currentTestFactor === 0) {
        factorOccurrences++;
        numberToDecompose /= currentTestFactor;
      }
      discoveredPrimeFactors.push({ prime: currentTestFactor, count: factorOccurrences });
    }
    currentTestFactor += 2; // Increment by 2 to skip even numbers.
  }

  // If numberToDecompose is still greater than 1 after the loop, it means the remaining value
  // is itself a prime factor (larger than its square root).
  if (numberToDecompose > 1) {
    discoveredPrimeFactors.push({ prime: numberToDecompose, count: 1 });
  }

  // --- Final Product Calculation ---
  let finalCalculatedProduct = 1; // Equivalent to 'ans' in the original code.

  // Iterate over the collected prime factor groups to compute the result.
  for (const factorGroup of discoveredPrimeFactors) {
    const pFactor = factorGroup.prime;
    const pCount = factorGroup.count;

    // Determine how many times this prime factor contributes to the final result.
    // This effectively calculates floor(pCount / requiredDivisor).
    const effectivePowerForFactor = Math.floor(pCount / requiredDivisor);

    // Only include the factor in the product if its effective power is positive.
    // This replaces the Math.max(..., 1) call with an explicit condition.
    if (effectivePowerForFactor > 0) {
      finalCalculatedProduct *= Math.pow(pFactor, effectivePowerForFactor);
    }
  }

  return finalCalculatedProduct;
}

// --- Local Debugging Function (Rewritten) ---
// This function helps in testing the core logic in a browser environment.
function executeLocalDebuggingScenario() {
  const inputElement = document.getElementById("debugInputArea");
  const outputElement = document.getElementById("debugOutputDisplay");

  if (!inputElement || !outputElement) {
    console.error("Required debug UI elements (debugInputArea, debugOutputDisplay) not found.");
    return;
  }

  try {
    const testInputContent = inputElement.value;
    const computedResult = ComputeSolutionFromInput(testInputContent);
    outputElement.textContent = `Calculated Result: ${computedResult}`;
    outputElement.style.color = "green";
  } catch (error) {
    console.error("An error occurred during local debug execution:", error.message);
    outputElement.textContent = `Error: ${error.message}`;
    outputElement.style.color = "red";
  }
}

// --- Standard Entry Point for Competitive Programming (Rewritten) ---
// This block ensures the primary function runs when the script is executed
// in environments like online judges, reading from standard input.
(function() {
  // Check if running in a Node.js-like environment where 'require' and 'process' exist.
  if (typeof require === 'function' && typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const fileSystem = require("fs");
      const standardInputPath = "/dev/stdin";
      const rawInputContent = fileSystem.readFileSync(standardInputPath, "utf8");
      const finalOutcome = ComputeSolutionFromInput(rawInputContent);
      console.log(finalOutcome.toString()); // Ensure the output is a string.
    } catch (error) {
      console.error("Execution failed: " + error.message);
      // In competitive programming, an error usually means a non-zero exit code.
      // process.exit(1); // Uncomment if explicit exit code is required for error.
    }
  } else {
    // This branch would typically handle browser-based execution or other non-Node environments.
    // For competitive programming, this part is often omitted.
    // However, if the debug function is intended for the browser, it might be called here.
    // For example: window.onload = executeLocalDebuggingScenario;
  }
})();