function calculateCubicSum(inputDataString) {
  // This routine processes a string input consisting of two space-separated numerical values.
  // It then computes a specialized sum involving the cubes of certain floor divisions.

  // Input validation: Ensure the provided input is a non-empty string.
  if (!inputDataString || typeof inputDataString !== 'string' || inputDataString.length === 0) {
    console.error("Error: Input data is invalid or empty. Expected a string.");
    return;
  }

  // Parse the input string into its constituent numerical components.
  // Using a regular expression to handle multiple spaces and filtering out empty strings.
  const numericStringComponents = inputDataString.trim().split(/\s+/).filter(Boolean);

  // Validate the number of components; precisely two are expected.
  if (numericStringComponents.length !== 2) {
    console.error(`Error: Expected two numeric inputs, but received ${numericStringComponents.length}.`);
    return;
  }

  // Convert string components to actual numbers.
  // Using Number() for the first operand and parseInt() for the second, specifying radix 10.
  const primaryOperand = Number(numericStringComponents[0]);
  const divisionFactor = parseInt(numericStringComponents[1], 10);

  // Further validation to ensure both parsed values are legitimate numbers.
  if (isNaN(primaryOperand) || isNaN(divisionFactor)) {
      console.error("Error: One or both input components are not valid numbers.");
      return;
  }

  // Critical check: The division factor must not be zero to prevent errors.
  if (divisionFactor === 0) {
      console.error("Error: The division factor cannot be zero.");
      return;
  }

  // Define the exponent for the cubic calculations as a named constant.
  const exponentValue = 3;

  // Create a reusable helper function to compute the cube of a number.
  const computeCube = (valueToCube) => valueToCube ** exponentValue;

  // Calculate the first part of the total sum.
  // This involves flooring the result of primaryOperand divided by divisionFactor, then cubing it.
  let cumulativeCubicSum = computeCube(Math.trunc(primaryOperand / divisionFactor));

  // Conditionally add a second term if the divisionFactor is an even number.
  // Using a bitwise AND operation for an efficient even number check.
  if (!(divisionFactor & 1)) { // Equivalent to (divisionFactor % 2 === 0)
    // Introduce an intermediate variable for half of the divisionFactor.
    const halfTheFactor = divisionFactor / 2;

    // Calculate the base for the second cubic term.
    // This involves adding halfTheFactor to primaryOperand, dividing by divisionFactor, and then flooring.
    const secondTermBaseValue = Math.trunc((primaryOperand + halfTheFactor) / divisionFactor);

    // Add the cube of this base value to the cumulative sum.
    cumulativeCubicSum += computeCube(secondTermBaseValue);
  }

  // Output the final computed sum to the console.
  console.log(cumulativeCubicSum);
}

// --- Program Execution Entry Point ---

// Obtain the necessary 'fs' module for file system operations.
const fileSystemUtility = require('fs');

// Specify the standard input path for competitive programming environments.
const standardInputLocation = '/dev/stdin';

// Define the character encoding for reading the input file.
const inputEncoding = 'utf8';

// Use a try-catch block to gracefully handle potential errors during file reading.
try {
  // Read the entire content of the standard input file synchronously.
  const rawInputContent = fileSystemUtility.readFileSync(standardInputLocation, inputEncoding);
  
  // Invoke the main calculation function with the obtained input.
  calculateCubicSum(rawInputContent);
} catch (errorDetails) {
  // Log an error message if reading from standard input fails.
  console.error("An error occurred while attempting to read from standard input:", errorDetails.message);
}