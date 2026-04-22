const getPositiveModulo = (value, modulus) => {
  // Ensures the result of a modulo operation is always positive.
  // Useful when intermediate calculations might result in negative numbers.
  return (value % modulus + modulus) % modulus;
};

const retrieveNumericParameters = (sourceText) => {
  // Parses the input string to extract numerical parameters.
  // Expects a space-separated string of numbers.
  const numericValues = sourceText.trim().split(' ').map(Number);

  // Basic validation for expected number of parameters.
  // In competitive programming, input format is usually guaranteed,
  // but this adds robustness for a Type III clone.
  if (numericValues.length < 2 || numericValues.some(isNaN)) {
    console.error("Input parsing failed: Expected two valid numbers.");
    // Return default values or throw an error based on requirements.
    // For this context, returning [0, 0] to avoid crashing.
    return [0, 0];
  }
  return numericValues;
};

const summationUpTo = (limit) => {
  // Calculates the sum of integers from 1 up to 'limit' (inclusive).
  // Uses the arithmetic series formula: n * (n + 1) / 2.
  if (limit < 0) {
    // Summing up to a negative number effectively means an empty set, so sum is 0.
    return 0;
  }
  // Using BigInt for intermediate products if numbers were much larger,
  // but for typical competitive programming constraints, Number is fine.
  return (limit * (limit + 1)) / 2;
};

const solveProblem = (dataString) => {
  // Define a large prime modulus for operations, standard in many problems.
  const primeModulus = 10**9 + 7;

  // Parse the input string to get the main parameters.
  const [upperLimit, lowerLimit] = retrieveNumericParameters(dataString);

  // Initialize the accumulator for the final result.
  let cumulativeResult = 0;

  // An explicit guard clause for cases where the lower bound
  // exceeds the effective upper bound for the loop.
  // The original loop would implicitly handle this, but an explicit check
  // is a Type III structural addition.
  if (lowerLimit > upperLimit + 1) {
      return getPositiveModulo(cumulativeResult, primeModulus);
  }

  // Iterate through possible lengths of sequences.
  // The loop runs from 'lowerLimit' up to 'upperLimit + 1'.
  for (let currentLength = lowerLimit; currentLength <= upperLimit + 1; currentLength++) {
    // Calculate the minimum possible sum for a sequence of 'currentLength' elements.
    // This corresponds to summing numbers from 0 up to (currentLength - 1).
    const minPossibleSum = summationUpTo(currentLength - 1);

    // Calculate the maximum possible sum for a sequence of 'currentLength' elements.
    // This corresponds to summing numbers from (upperLimit - currentLength + 1) up to 'upperLimit'.
    // This is rewritten using the difference of two summationUpTo calls for Type III variation.
    // Sum(N - I + 1 to N) = Sum(1 to N) - Sum(1 to N - I)
    const sumUpToN = summationUpTo(upperLimit);
    const sumUpToNMinusI = summationUpTo(upperLimit - currentLength);
    const maxPossibleSum = sumUpToN - sumUpToNMinusI;

    // Calculate the contribution of the current iteration to the total result.
    // This formula (max - min + 1) represents the number of ways or count
    // for a specific 'currentLength'.
    const currentIterationContribution = maxPossibleSum - minPossibleSum + 1;

    // Accumulate the result, applying the modulo operation at each step.
    // Applying modulo inside the loop is a Type III change to prevent
    // potential overflow of 'cumulativeResult' for very large inputs,
    // even if not strictly necessary for all problem constraints.
    cumulativeResult = getPositiveModulo(cumulativeResult + currentIterationContribution, primeModulus);
  }

  // Return the final result, ensuring it's positive and within the modulus.
  return getPositiveModulo(cumulativeResult, primeModulus);
};

// This block handles the execution environment for the solution.
// It determines whether to read from a development input file or standard input.
const initializeAndExecute = () => {
  const fileSystemModule = require('fs'); // Dynamically import fs module.
  let sourceInputPath;

  // Determine the input file path based on environment variables.
  // This is a refactored and slightly rephrased version of the original ternary operator.
  if (process.env.MYTEST && process.env.MYTEST !== 'test') {
    // If MYTEST is defined but not 'test', assume it's a dev-specific path.
    sourceInputPath = 'dev/stdin';
  } else if (process.env.MYTEST === 'test') {
      // If MYTEST is explicitly 'test', for this clone, we'll use a dummy input
      // or 'dev/stdin' if a test file structure is expected.
      // Since `test()` function is not provided, we just point to dev/stdin for consistency
      // with the non-test branch for MYTEST.
      sourceInputPath = 'dev/stdin';
  } else {
    // Default path for standard competitive programming environments.
    sourceInputPath = '/dev/stdin';
  }

  let rawInputData;
  try {
    rawInputData = fileSystemModule.readFileSync(sourceInputPath, 'utf8');
  } catch (error) {
    console.error(`Failed to read input from ${sourceInputPath}: ${error.message}`);
    // Provide a fallback input to prevent program crash in case of file read error.
    rawInputData = "0 0";
  }

  // Execute the main problem-solving function and print the result.
  const calculatedOutput = solveProblem(rawInputData);
  console.log(calculatedOutput);
};

// Invoke the execution logic.
initializeAndExecute();