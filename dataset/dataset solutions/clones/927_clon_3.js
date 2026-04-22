(function programExecutionWrapper() {

  /**
   * Computes the N-th Fibonacci number using Binet's formula.
   * Ensures non-negative integer input.
   * @param {number} sequencePosition - The 0-based index of the Fibonacci number to compute.
   * @returns {number} The Fibonacci number at the specified position.
   */
  function calculateFibonacciByBinet(sequencePosition) {
    // Validate input to ensure it's a valid non-negative integer for the sequence.
    if (typeof sequencePosition !== 'number' || !Number.isInteger(sequencePosition) || sequencePosition < 0) {
      console.error("Error: Fibonacci index must be a non-negative integer.");
      // For robustness, returning 0 for invalid input, or could throw an error.
      return 0;
    }

    // Handle base cases for the Fibonacci sequence explicitly.
    // F(0) = 0, F(1) = 1.
    if (sequencePosition === 0) {
      return 0;
    }
    if (sequencePosition === 1) {
      return 1;
    }

    // Define mathematical constants required for Binet's formula.
    // This value is the square root of five.
    const constantForRootFive = Math.sqrt(5.0);

    // Calculate the golden ratio (Phi) and its conjugate (Psi).
    // Phi = (1 + sqrt(5)) / 2
    const goldenRatioPhiValue = (1.0 + constantForRootFive) / 2.0;
    // Psi = (1 - sqrt(5)) / 2
    const goldenRatioPsiValue = (1.0 - constantForRootFive) / 2.0;

    // Compute the powers of Phi and Psi for the given sequence position.
    // Phi^n
    const phiToThePowerN = Math.pow(goldenRatioPhiValue, sequencePosition);
    // Psi^n
    const psiToThePowerN = Math.pow(goldenRatioPsiValue, sequencePosition);

    // Calculate the inverse of the square root of five.
    const oneDividedByRootFive = 1.0 / constantForRootFive;

    // Apply Binet's formula: F(n) = (Phi^n - Psi^n) / sqrt(5)
    const exactFibonacciResult = oneDividedByRootFive * (phiToThePowerN - psiToThePowerN);

    // Round the floating-point result to the nearest integer,
    // as Fibonacci numbers are always integers.
    const finalRoundedValue = Math.round(exactFibonacciResult);

    return finalRoundedValue;
  }

  // Obtain the file system module for reading input.
  const fileSystemHandler = require('fs');

  // Specify the standard input device path typical in Unix-like systems.
  const standardInputDevicePath = '/dev/stdin';

  let rawInputContent;
  try {
    // Read the entire content of the standard input as a UTF-8 string.
    rawInputContent = fileSystemHandler.readFileSync(standardInputDevicePath, 'utf8');
  } catch (readError) {
    // Log an error if input reading fails and terminate execution.
    console.error(`Failed to retrieve input data: ${readError.message}`);
    return; // Exit the program gracefully.
  }

  // Clean and parse the raw input string into an integer.
  // Remove leading/trailing whitespace, then convert to a base-10 integer.
  const cleanedInputString = rawInputContent.trim();
  let parsedNumericInput = parseInt(cleanedInputString, 10);

  // Validate if the parsed input is a valid number.
  if (isNaN(parsedNumericInput)) {
    console.error("Input provided is not a valid numerical value. Please provide an integer.");
    return; // Terminate if input is invalid.
  }

  // The problem specifies calculating F(n+1), so we increment the input value.
  // This adjusts the sequence index for the Fibonacci calculation.
  const adjustedFibonacciIndex = parsedNumericInput + 1;

  // Compute the Fibonacci number for the adjusted index using our helper function.
  const computedFibonacciTerm = calculateFibonacciByBinet(adjustedFibonacciIndex);

  // Display the final calculated Fibonacci number to the console.
  console.log(computedFibonacciTerm);

})(); // End of the self-executing function.