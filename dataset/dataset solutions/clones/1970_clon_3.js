// This module encapsulates the logic for processing numeric input and calculating a specific sequence sum.

const calculateSequenceSum = (rawInputData) => {
  // Define a constant for the modulo operation. Using BigInt for large number arithmetic.
  const RESULT_MODULO_CONSTANT = 1000000007n;

  // Specify the character used to separate values within the input string.
  const INPUT_VALUE_SEPARATOR = ' ';

  // Internal utility function to parse a string value into an integer with basic validation.
  const safelyParseInteger = (stringValue, fieldName) => {
    const parsedNumber = parseInt(stringValue, 10);
    // If parsing fails, log a warning and return a default value (e.g., 0)
    // or throw an error for stricter validation.
    if (isNaN(parsedNumber)) {
      console.warn(`Input parsing warning: Non-numeric value "${stringValue}" found for ${fieldName}. Defaulting to 0.`);
      return 0; 
    }
    return parsedNumber;
  };

  // Pre-process the input string: trim whitespace and split into individual string segments.
  const inputSegments = rawInputData.trim().split(INPUT_VALUE_SEPARATOR);

  // Validate that the required number of input parameters are present.
  if (inputSegments.length < 2) {
    console.error("Input error: Expected at least two numeric parameters, but received fewer.");
    // In a production system, this would likely throw an exception.
    return;
  }

  // Parse the first two significant parameters from the input segments.
  const firstNumericParam = safelyParseInteger(inputSegments[0], 'First Parameter (N)');
  const secondNumericParam = safelyParseInteger(inputSegments[1], 'Second Parameter (K)');

  // Apply the initial adjustment to the first parameter.
  // All subsequent core calculations utilize BigInts to handle potentially large numbers
  // without exceeding JavaScript's standard number precision limits.
  const adjustedNValue = BigInt(firstNumericParam) + 1n; 
  const kValueBigInt = BigInt(secondNumericParam);

  // Determine the effective upper bound for the sequence summation.
  // This corresponds to the 'max' variable in the original logic.
  // Formula: (N + 1) - K + 1  =>  N - K + 2
  const effectiveSequenceUpperBound = adjustedNValue - kValueBigInt + 1n;

  // Implement a guard clause: If the calculated upper bound is negative,
  // the sequence is considered empty or invalid, and its sum is 0.
  if (effectiveSequenceUpperBound < 0n) {
    console.log(0n); // Output 0 for an invalid sequence.
    return;
  }

  // Calculate the sum of the sequence from 1 to 'effectiveSequenceUpperBound'.
  // The sum of an arithmetic series 1 + 2 + ... + X is given by the formula X * (X + 1) / 2.
  // We ensure all intermediate calculations are performed using BigInts.
  const sumIntermediateProduct = effectiveSequenceUpperBound * (effectiveSequenceUpperBound + 1n);
  const totalAccumulatedSum = sumIntermediateProduct / 2n; 

  // Apply the modulo operation to the final sum as required.
  const finalComputedResult = totalAccumulatedSum % RESULT_MODULO_CONSTANT;

  // Output the final result.
  console.log(finalComputedResult);
};

// Standard boilerplate for reading input in a competitive programming environment.
// Reads the entire content from /dev/stdin as a UTF-8 string.
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Invoke the main calculation function with the obtained input data.
calculateSequenceSum(standardInputContent);