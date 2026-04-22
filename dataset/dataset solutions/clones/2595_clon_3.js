// This module contains a function designed to calculate a specific iteration count based on two input numbers.
// It is a re-engineered variant of an existing algorithm, focusing on a direct mathematical approach
// and enhanced input validation compared to its original form.

function calculateRequiredOperations(inputDataString) {
  // Split the incoming string into two distinct segments, assuming space as a delimiter.
  const dataSegments = inputDataString.split(" ");
  
  // Extract the string representations of the first and second parameters.
  const firstValString = dataSegments[0];
  const secondValString = dataSegments[1];

  // Implement an early exit condition: If the target value (second parameter) is '1',
  // the operation count is always zero, regardless of the starting value.
  if (secondValString === '1') {
    console.log("0");
    return; // Exit the function immediately.
  }

  // Convert the extracted string values into numeric types for computation.
  // Using the global Number() function for explicit type conversion.
  const initialValue = Number(firstValString);
  const targetValue = Number(secondValString);

  // Perform basic input validation: Check if both converted values are actual numbers.
  // If not, it indicates invalid input, and an error message is logged.
  if (isNaN(initialValue) || isNaN(targetValue)) {
    console.log("Error: One or both input values are not valid numbers.");
    return; // Halt execution due to invalid input.
  }
  
  // Handle a critical edge case: If the initial value is 1 and the target value is greater than 1,
  // the original iterative logic would fall into an infinite loop (1 + (1-1) + (1-1)... never reaches B > 1).
  // This revised implementation provides a specific output (-1) to denote this uncomputable or problematic state.
  if (initialValue === 1 && targetValue > 1) {
    console.log("-1"); // Indicating an infinite loop or unachievable state.
    return;
  }

  // For all other valid scenarios, the problem can be resolved using a direct mathematical formula.
  // The goal is to determine how many times (initialValue - 1) needs to be added to initialValue
  // to reach or exceed targetValue.
  // Let 'k' be the number of additions: initialValue + k * (initialValue - 1) >= targetValue.
  // Solving for k: k >= (targetValue - initialValue) / (initialValue - 1).
  // Since 'k' must be an integer and we need to meet or exceed, Math.ceil is used.
  // The total operation count (similar to 'count' in the original) is 'k + 1',
  // where '1' accounts for the initial state.
  
  // Calculate the raw number of incremental steps needed.
  let rawIncrementalSteps = (targetValue - initialValue) / (initialValue - 1);
  
  // Apply ceiling function to ensure we reach or surpass the target.
  // This handles fractional steps by rounding up.
  let actualIncrementalSteps = Math.ceil(rawIncrementalSteps);
  
  // The final count is the initial state (1) plus the calculated incremental steps.
  // This formula correctly handles cases where targetValue <= initialValue (resulting in 1).
  let finalOperationTally = actualIncrementalSteps + 1;

  // Output the determined total operation tally.
  console.log(finalOperationTally);
}

// Standard entry point for execution in a typical competitive programming environment.
// Reads input from standard input and passes it to the main processing function.
calculateRequiredOperations(require("fs").readFileSync("/dev/stdin", "utf8"));