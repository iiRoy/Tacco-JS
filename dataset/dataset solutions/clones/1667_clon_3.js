function ComputeDivisibleRangeCount(problemInputString) {
  // This function determines the total quantity of numbers within a specified range
  // that are perfectly divisible by a given factor.
  // The input is expected as a single string containing three space-separated integers.

  // Step 1: Deconstruct the input string into its constituent parts.
  const inputSegments = problemInputString.split(" ");

  // Validate the number of input segments to ensure correctness.
  if (inputSegments.length !== 3) {
    console.error("Input data malformed: Expected exactly three numerical values.");
    return; // Terminate execution or handle error appropriately.
  }
  
  // Step 2: Convert string segments into integer values.
  // Using parseInt with radix for explicit conversion.
  const rangeStartValue = parseInt(inputSegments[0], 10); // Represents the lower boundary (original 'l')
  const rangeEndValue = parseInt(inputSegments[1], 10);   // Represents the upper boundary (original 'r')
  const divisionFactor = parseInt(inputSegments[2], 10);   // Represents the divisor (original 'd')

  // Step 3: Perform validation checks on the parsed numerical inputs.
  if (isNaN(rangeStartValue) || isNaN(rangeEndValue) || isNaN(divisionFactor)) {
    console.error("Input data error: One or more provided values are not valid numbers.");
    return; // Exit if parsing failed for any component.
  }
  
  // Crucial validation: Ensure the divisor is a positive integer.
  // Division by zero or negative divisors would lead to undefined or incorrect results.
  if (divisionFactor <= 0) {
    console.error("Invalid divisor: The division factor must be a positive integer.");
    console.log(0); // If divisor is invalid, no numbers can be correctly counted as divisible.
    return;
  }

  // Step 4: Calculate the total count of divisible numbers using a mathematical approach.
  // This replaces the iterative loop found in the original code for improved efficiency
  // and a different algorithmic structure (Type III change).
  
  // Calculate how many multiples of 'divisionFactor' exist up to 'rangeEndValue'.
  // Example: For rangeEndValue=10, divisionFactor=3, countUpToMax = floor(10/3) = 3 (3, 6, 9)
  const countUpToMaximumBound = Math.floor(rangeEndValue / divisionFactor);
  
  // Calculate how many multiples of 'divisionFactor' exist strictly before 'rangeStartValue'.
  // This is equivalent to counting up to (rangeStartValue - 1).
  // Example: For rangeStartValue=2, divisionFactor=3, countBeforeMin = floor((2-1)/3) = floor(1/3) = 0
  const countStrictlyBeforeMinimum = Math.floor((rangeStartValue - 1) / divisionFactor);
  
  // The final tally is the difference between these two counts.
  // This yields the number of multiples within the inclusive range [rangeStartValue, rangeEndValue].
  let finalMatchingCount = countUpToMaximumBound - countStrictlyBeforeMinimum;

  // Step 5: Output the computed result to the console.
  // Enhanced output message for clarity (Type III addition).
  console.log(`The number of values perfectly divisible by ${divisionFactor} within the range [${rangeStartValue}, ${rangeEndValue}] is: ${finalMatchingCount}`);
}

// --- Execution Entry Point ---
// This part handles reading input from standard input and invoking the main processing function.

// Define the standard input file path.
const standardInputFile = "/dev/stdin";

// Read the entire content of the standard input file synchronously.
// Ensure UTF-8 encoding for text interpretation.
const rawInputContent = require("fs").readFileSync(standardInputFile, "utf8");

// Initiate the problem-solving process by calling the main function with the obtained input.
ComputeDivisibleRangeCount(rawInputContent);