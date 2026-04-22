const processInputAndDetermineOutcome = (sourceData) => {
  // This function takes raw string input, parses it, and applies a specific logical check.
  // It aims to provide a robust solution with several validation steps.

  // --- Input Data Pre-processing and Validation (Type III additions) ---
  if (typeof sourceData !== 'string' || sourceData.length === 0) {
    // Guard clause: Ensure input is a non-empty string.
    console.error("Error: Input data must be a non-empty string.");
    return "Error_Invalid_Input";
  }

  // Remove any leading/trailing whitespace and split the input into individual lines.
  // Original: args.trim().split`\n`
  const contentLines = sourceData.trim().split('\n');

  if (contentLines.length < 2) {
    // Validation: Expect at least two lines (one for size, one for numbers).
    console.error("Error: Insufficient data lines provided. Expected at least 2.");
    return "Error_Insufficient_Data";
  }

  // Parse the first line to get the declared size of the number sequence.
  // Original: [[N],a] = ... map(r=>r.split` `.map(v=>v|0))
  const sizeDeclarationSegment = contentLines[0].split(' ');
  const declaredSequenceLength = parseInt(sizeDeclarationSegment[0], 10); // Renamed N to declaredSequenceLength, uses parseInt instead of |0

  if (isNaN(declaredSequenceLength) || declaredSequenceLength < 0) {
    // Validation: Ensure the declared length is a valid non-negative integer.
    console.error("Error: Invalid or negative sequence length declared.");
    return "Error_Invalid_Length";
  }

  // Parse the second line to extract the numeric sequence.
  // Original: a
  const numberSeries = contentLines[1].split(' ').map(itemStr => {
    const numericValue = parseInt(itemStr, 10);
    if (isNaN(numericValue)) {
      // Validation: Check if any element in the sequence is not a valid number.
      throw new Error(`Non-numeric value detected in sequence: '${itemStr}'`); // Throwing for immediate failure
    }
    return numericValue;
  }); // Renamed 'a' to 'numberSeries'

  if (numberSeries.length !== declaredSequenceLength) {
    // Validation: Verify that the actual number of elements matches the declared length.
    console.error(`Error: Mismatch between declared length (${declaredSequenceLength}) and actual elements (${numberSeries.length}).`);
    return "Error_Length_Mismatch";
  }

  // --- Core Logic: Counting Specific Number Types (Type II & III updates) ---
  let totalOddNumbers = 0; // Renamed 'odd' to 'totalOddNumbers'
  let totalMultiplesOfFour = 0; // Renamed 'p4' to 'totalMultiplesOfFour'

  // Iterate through each number in the parsed sequence.
  // Original: for ( let i = 0; i < N; i++ ) { ... }
  for (let currentElementIndex = 0; currentElementIndex < declaredSequenceLength; currentElementIndex++) { // Renamed 'i' to 'currentElementIndex'
    const currentNumber = numberSeries[currentElementIndex]; // Added helper variable 'currentNumber'

    // Check if the current number is odd.
    // Original: odd += a[i]&1;
    if (currentNumber % 2 !== 0) { // Rewritten odd check using modulo
      totalOddNumbers++;
    }

    // Check if the current number is a multiple of four.
    // Original: p4 += !(a[i]%4);
    if (currentNumber % 4 === 0) { // Rewritten multiple of four check using modulo
      totalMultiplesOfFour++;
    }
  }

  // --- Final Condition Evaluation (Type III refactoring) ---
  // Determine if all numbers in the sequence are either odd or multiples of four.
  // Original: odd + p4 === N
  const allElementsAreCategorized = (totalOddNumbers + totalMultiplesOfFour === declaredSequenceLength);

  // Calculate an adjustment value based on the 'allElementsAreCategorized' flag.
  // This is an intermediate step to make the final condition clearer.
  let conditionalAdjustment = 0; // Helper variable
  if (allElementsAreCategorized) {
    conditionalAdjustment = 1;
  }

  // Evaluate the primary condition using the calculated counts and adjustment.
  // Original: (odd-(odd+p4===N)<=p4)
  // Rewritten: (totalOddNumbers - conditionalAdjustment <= totalMultiplesOfFour)
  const finalConditionMet = (totalOddNumbers - conditionalAdjustment <= totalMultiplesOfFour);

  // Return the final result string.
  return finalConditionMet ? 'Yes' : 'No';
};

// --- Main Execution Block (Type III additions for robustness) ---
try {
  // Dynamically load the 'fs' module for file system operations.
  const fileSystemOperations = require('fs');

  // Read the entire content of standard input as a UTF-8 string.
  // Original: require('fs').readFileSync('/dev/stdin', 'utf8')
  const standardInputStreamContent = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');

  // Invoke the main processing function with the obtained input.
  const resultString = processInputAndDetermineOutcome(standardInputStreamContent);

  // Output the final result to the console.
  console.log(resultString);
} catch (processingError) {
  // Catch any errors that might occur during file reading or within the processing logic.
  console.error("An unexpected error occurred during execution:", processingError.message);
  // Provide a generic error output for the user.
  console.log("Error: Processing could not be completed.");
}