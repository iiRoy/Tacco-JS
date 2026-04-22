const calculateMinSteps = (inputStr) => {
  // Process raw input string, removing leading/trailing whitespace
  const rawInput = inputStr.trim();

  // Convert the cleaned input into an integer, specifying base 10 for robustness
  const targetNum = Number.parseInt(rawInput, 10);

  // --- Type III: Add guard clauses and input validation ---
  // Ensure the target number is a valid non-negative integer
  if (isNaN(targetNum) || targetNum < 0) {
    // In a real application, this might throw an error or log to stderr.
    // For this context, returning an error string as per the expected output type.
    return "Error: Invalid input provided. Please supply a non-negative integer.";
  }

  // Define a maximum limit to prevent excessive memory allocation or computation time
  const MAX_TARGET_LIMIT = 100000;
  if (targetNum > MAX_TARGET_LIMIT) {
    return `Error: Target value (${targetNum}) exceeds the maximum allowed limit (${MAX_TARGET_LIMIT}).`;
  }
  // --- End of guard clauses ---

  // Initialize a dynamic programming table.
  // 'opCounts[k]' will store the minimum number of operations required to reach 'k'.
  // All entries are initially set to positive infinity, indicating an unreachable state.
  const opCounts = new Array(targetNum + 1).fill(Number.POSITIVE_INFINITY);

  // Base case: Zero operations are needed to reach the number zero.
  opCounts[0] = 0;

  // Define the types of 'jumps' (steps) that can be added:
  // 1: Adding 1 (the basic increment operation)
  // 6: Adding powers of 6 (6, 36, 216, ...)
  // 9: Adding powers of 9 (9, 81, 729, ...)
  const jumpBases = [1, 6, 9];

  // Iterate through each number from 0 up to (but not including) the target number.
  // 'current' represents the number we are currently at in our DP progression.
  for (let current = 0; current < targetNum; ++current) {
    // Retrieve the minimum operations count for the 'current' number.
    const currentOps = opCounts[current];

    // If the 'current' number is unreachable, any path through it would also be
    // unreachable with finite operations, so skip to the next number.
    if (currentOps === Number.POSITIVE_INFINITY) {
      continue;
    }

    // --- Type III: Refactor loops for applying steps ---
    // Iterate over each defined jump base (1, 6, 9)
    for (const base of jumpBases) {
      let currentStepValue = base; // Start with the base itself (e.g., 1, 6, 9)

      // Continuously apply powers of the current base as steps
      while (true) {
        const nextIndex = current + currentStepValue;

        // If the next index exceeds our target number, this step is too large.
        // Break out of the inner loop for this base.
        if (nextIndex > targetNum) {
          break;
        }

        // Update the minimum operations for 'nextIndex'.
        // This is equivalent to the original `if (dp[i] < dp[i+j]) dp[i+j] = dp[i] + 1;`
        // but uses Math.min for explicit clarity and safety.
        opCounts[nextIndex] = Math.min(opCounts[nextIndex], currentOps + 1);

        // If the base is 1, we only add 1 once, then stop for this base.
        // This prevents an infinite loop for base 1 and correctly handles the +1 operation.
        if (base === 1) {
          break;
        }

        // --- Type III: Add a check to prevent unnecessary large calculations and potential overflow ---
        // If multiplying 'currentStepValue' by 'base' would result in a step
        // that clearly exceeds 'targetNum' when added to 'current', we can stop early.
        // This also helps mitigate potential numerical overflow for very large numbers,
        // although less critical for typical 'targetNum' values in this problem.
        if (currentStepValue > targetNum / base) {
             break;
        }
        // --- End of additional check ---

        // Calculate the next power of the base (e.g., 6 -> 36 -> 216)
        currentStepValue *= base;
      }
    }
  }

  // The final result is the minimum operations to reach the 'targetNum'.
  const finalResultCount = opCounts[targetNum];

  // --- Type III: Add a check for unreachable target ---
  // If the target number is still positive infinity, it means it's unreachable
  // with the given operations. This scenario is unlikely for non-negative integers
  // with a '+1' operation, but robust for other DP problems.
  if (finalResultCount === Number.POSITIVE_INFINITY) {
    return "Error: Target number is unreachable.";
  }
  // --- End of unreachable check ---

  // Convert the numerical result to a string before returning.
  return String(finalResultCount);
};

// --- Type III: Separate input reading and output logging from the core logic ---
// Read input from standard input using Node.js 'fs' module.
// Ensure UTF-8 encoding is specified for text input.
const inputDataFromFile = require('fs').readFileSync('/dev/stdin', 'utf8');

// Execute the calculation function with the obtained input.
const calculatedOutput = calculateMinSteps(inputDataFromFile);

// Output the final computed result to the console.
console.log(calculatedOutput);