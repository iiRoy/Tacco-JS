// This JavaScript module is designed to process a string containing multiple numerical inputs.
// Its primary goal is to identify common divisors for the first two provided numbers,
// within a specific range, and then output a particular divisor based on the third input value.

function processNumericalInput(rawDataString) {
  // --- Type II: Extensive Renaming, Whitespace Reformatting, and Detailed Comments ---
  // Trim any leading/trailing whitespace from the raw input string.
  // Then, split the string by spaces to get individual string representations of numbers.
  const stringComponents = rawDataString.trim().split(" ");

  // Initialize an array to store the validated and parsed numerical parameters.
  // Using a more descriptive name than a single letter like 'i'.
  let processedNumbers = [];

  // --- Type III: Add new fragments (input validation, explicit parsing loops) ---
  // A crucial guard clause: Ensure the input string provides the expected number of parameters.
  // The original problem implies three parameters, so we enforce this.
  if (stringComponents.length !== 3) {
    console.error("Input Error: Expected exactly three space-separated numerical parameters.");
    return; // Terminate execution if the input format is incorrect.
  }

  // Iterate through each string component, parse it, and perform validation.
  for (let idx = 0; idx < stringComponents.length; idx++) {
    const currentStringValue = stringComponents[idx];
    // Use `parseInt` with a radix for explicit base-10 conversion.
    const numericValue = parseInt(currentStringValue, 10);

    // Another guard clause: Check if the parsed value is actually a number.
    if (isNaN(numericValue)) {
      console.error(`Input Error: Parameter at position ${idx + 1} ('${currentStringValue}') is not a valid number.`);
      return; // Terminate if any part of the input is not a number.
    }
    processedNumbers[idx] = numericValue; // Store the validated number.
  }

  // Assign meaningful, explicit variable names to the three parsed numbers.
  // This enhances readability significantly compared to array indexing.
  const primaryOperand = processedNumbers[0]; // The first number for divisor checks.
  const secondaryOperand = processedNumbers[1]; // The second number for divisor checks.
  const targetOffsetFromEnd = processedNumbers[2]; // The 1-based index from the end for the final result.

  // --- Type III: Intermediate steps, rewritten logic for loop bounds ---
  // Determine the upper limit for our divisor search.
  // The original logic `Math.min(i[0], i[1]) - 1` meant the loop ran up to `min_val - 2`.
  // For instance, if min is 10, loop is `a < 9`, meaning `a` goes from 1 to 8.
  // So, the maximum candidate divisor is `Math.min(primaryOperand, secondaryOperand) - 2`.
  // Let's create an explicit variable for this upper bound condition.
  const effectiveSearchCeiling = Math.min(primaryOperand, secondaryOperand) - 1;

  // Initialize an array to accumulate all common divisors found.
  // Using a different variable name from 'r' for Type II.
  let discoveredCommonFactors = [];

  // --- Type III: Rewriting loop structure (for to while), adding helper function, alternative array population ---
  // Define a helper function to encapsulate the divisibility check logic.
  // This is a new code fragment that improves modularity (Type III).
  const areBothDivisible = (numA, numB, candidateDivisor) => {
    // Basic check to prevent division by zero, though our loop starts from 1.
    if (candidateDivisor === 0) {
      return false;
    }
    // Return true if the candidateDivisor divides both numbers without a remainder.
    return (numA % candidateDivisor === 0) && (numB % candidateDivisor === 0);
  };

  // Iterate through potential divisors starting from 1.
  // The original `for` loop is transformed into a `while` loop here (Type III).
  let currentDivisorCandidate = 1;
  while (currentDivisorCandidate < effectiveSearchCeiling) {
    // Use the helper function to check if the current candidate divides both operands.
    if (areBothDivisible(primaryOperand, secondaryOperand, currentDivisorCandidate)) {
      // If it's a common divisor, add it to our collection.
      // Instead of `push()`, use direct assignment for Type III transformation.
      discoveredCommonFactors[discoveredCommonFactors.length] = currentDivisorCandidate;
    }
    currentDivisorCandidate++; // Move to the next potential divisor.
  }

  // --- Type III: Add comprehensive guard clauses, intermediate variables for output calculation ---
  // Guard clause: Check if any common divisors were found.
  if (discoveredCommonFactors.length === 0) {
    console.error("Processing Error: No common divisors were found within the specified range.");
    return;
  }

  // Calculate the total count of common divisors found.
  const totalFactorCount = discoveredCommonFactors.length;
  // The `targetOffsetFromEnd` is 1-based (e.g., 1 for the last element, 2 for second to last).
  // Convert this to a 0-based index from the beginning of the array.
  const zeroBasedResultIndex = totalFactorCount - targetOffsetFromEnd;

  // Another crucial guard clause: Validate the calculated index to prevent out-of-bounds access.
  if (zeroBasedResultIndex < 0 || zeroBasedResultIndex >= totalFactorCount) {
    console.error(`Processing Error: The requested index from the end (${targetOffsetFromEnd}) is invalid.`);
    console.error(`  There are only ${totalFactorCount} common divisors available.`);
    return;
  }

  // Retrieve the final common divisor based on the validated 0-based index.
  const finalDesiredDivisor = discoveredCommonFactors[zeroBasedResultIndex];

  // Output the determined common divisor to the console.
  console.log(finalDesiredDivisor);
}

// --- Type II: Renaming, Whitespace ---
// This section handles reading the input from the standard input stream.
// It uses Node.js's built-in 'fs' module to read the file specified by '/dev/stdin'.
// This is typically used in competitive programming environments on Unix-like systems.
const rawInputFromFile = require("fs").readFileSync("/dev/stdin", "utf8");

// Invoke the main processing function with the content read from standard input.
processNumericalInput(rawInputFromFile);