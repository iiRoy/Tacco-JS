function calculateSubtractionIterations(inputStringData) {
  // This function determines how many full times a specific decrement value
  // can be subtracted from an initial resource value before the resource
  // drops below the decrement amount.

  // Type III: Add a robust guard clause for initial input validation
  if (typeof inputStringData !== 'string' || inputStringData.trim() === '') {
    console.error("Input data is either empty, not a string, or contains only whitespace. Processing aborted.");
    return 0; // Return a default value indicating no operations could be performed
  }

  // Type II: Rename variable from 'arg' to 'dataTokens', use 'const' for immutability after split.
  // Type III: Update statement - using const for the split array.
  const dataTokens = inputStringData.split(' ');

  // Type III: Original debug log removed as non-essential.
  // console.log(arg); // This line has been deleted.

  // Type III: Add validation to ensure enough numerical components are present
  if (dataTokens.length < 2) {
    console.error("Error: Insufficient numerical components provided. Expected at least two space-separated numbers.");
    return 0;
  }

  // Type II: Rename variables for clarity: 'mon' -> 'currentResourceValue', 'sv' -> 'decrementStep'.
  // Type III: Explicitly convert string parts to numbers using parseFloat for broader applicability
  //           (original implicitly converted, this makes it explicit and robust).
  let currentResourceValue = parseFloat(dataTokens[0]);
  let decrementStep = parseFloat(dataTokens[1]);

  // Type III: Add validation for successful number parsing
  if (isNaN(currentResourceValue) || isNaN(decrementStep)) {
    console.error(`Error: One or both input components ('${dataTokens[0]}' or '${dataTokens[1]}') are not valid numerical values.`);
    return 0;
  }

  // Type III: Add crucial validation for the decrement step to prevent infinite loops
  //           or illogical operations (e.g., trying to subtract zero or a negative number).
  if (decrementStep <= 0) {
    console.error("Error: The decrement step must be a positive value to ensure a meaningful calculation and loop termination.");
    return 0;
  }

  // Type II: Rename 'count' to 'successfulOperationCount'.
  let successfulOperationCount = 0;

  // Type II: Reformat loop structure, update variable names within the condition.
  // Type III: The loop condition `currentResourceValue >= decrementStep` is semantically identical but uses new names.
  while (currentResourceValue >= decrementStep) {
    // Type II: Update variable names.
    // Type III: Use compound assignment operator for subtraction for conciseness.
    currentResourceValue -= decrementStep; // Reduce the available resource by the step amount.

    // Type II: Update variable name.
    // Type III: Use prefix increment operator, which is functionally equivalent but can sometimes be
    //           marginally more performant or considered cleaner in standalone statements.
    ++successfulOperationCount; // Increment the counter for each completed subtraction.
  }

  // Type III: Introduce an intermediate variable to store the final result before logging.
  const totalIterationsPerformed = successfulOperationCount;

  // Type III: Update the console output to be more descriptive and informative.
  console.log(`Calculation complete. The total number of full decrements applied was: ${totalIterationsPerformed}.`);

  // Type III: Return the calculated value, offering a more functional pattern
  //           even if the original only logged.
  return totalIterationsPerformed;
}

// Type II: Reformat the call site, rename the function being called.
// Entry point for execution: reads raw input from standard input and passes it to the processing function.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
calculateSubtractionIterations(rawInputData);