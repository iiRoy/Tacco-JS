const findBanknoteCombination = (rawDataString) => {
  // This routine aims to determine the specific counts of 1000-yen, 5000-yen,
  // and 10000-yen bills that sum up to a target amount using a precise total
  // number of bills.
  // It handles input parsing, validation, and computes the bill distribution.

  const inputParts = rawDataString.trim().split(/\s+/);

  // Initial validation: ensure exactly two numerical arguments are provided.
  if (inputParts.length !== 2) {
    return "-1 -1 -1"; // Indicate an invalid input format.
  }

  // Convert string parts to numerical values.
  const billTotalCount = Number(inputParts[0]);
  const monetaryTargetAmount = Number(inputParts[1]);

  // Further validation for the parsed numerical inputs.
  // Checks for non-numeric values, negative counts, or negative amounts.
  if (isNaN(billTotalCount) || isNaN(monetaryTargetAmount) || billTotalCount < 0 || monetaryTargetAmount < 0) {
    return "-1 -1 -1"; // Return error for invalid numerical input.
  }

  // Optimization: If the target amount isn't a multiple of 1000,
  // no combination of 1000, 5000, or 10000 yen bills can achieve it.
  if (monetaryTargetAmount % 1000 !== 0) {
    return "-1 -1 -1"; // No solution possible under these conditions.
  }

  // Placeholder for the successful bill combination.
  let solutionOutput = [-1, -1, -1];
  let isCombinationFound = false; // Flag to exit nested loops efficiently.

  // Let 'kilo' represent the count of 1000-yen bills.
  // Loop through all possible counts for 1000-yen bills, from 0 up to the total bill count.
  for (let kilo = 0; kilo <= billTotalCount; kilo++) {
    // If a valid combination has already been found, terminate outer loop early.
    if (isCombinationFound) break;

    // Calculate the remaining number of bills after allocating 'kilo' 1000-yen bills.
    const remainingBillsForHigherDenominations = billTotalCount - kilo;

    // Let 'fiveK' represent the count of 5000-yen bills.
    // Loop through possible counts for 5000-yen bills.
    // 'fiveK' cannot exceed the remaining bills.
    for (let fiveK = 0; fiveK <= remainingBillsForHigherDenominations; fiveK++) {
      // If a valid combination has already been found, terminate inner loop early.
      if (isCombinationFound) break;

      // Let 'tenK' represent the count of 10000-yen bills.
      // This count is determined directly by the remaining bills,
      // ensuring that kilo + fiveK + tenK equals billTotalCount.
      const tenK = remainingBillsForHigherDenominations - fiveK;

      // Ensure that the calculated 'tenK' count is non-negative.
      // (This check provides robustness, though loop bounds usually prevent negative values).
      if (tenK < 0) {
        continue; // Skip to the next iteration if 'tenK' is invalid.
      }

      // Calculate the total monetary value for the current combination.
      // Correct formula: sum of (count * denomination).
      const currentEvaluatedSum = (kilo * 1000) + (fiveK * 5000) + (tenK * 10000);

      // Check if the current sum matches the target amount.
      if (currentEvaluatedSum === monetaryTargetAmount) {
        solutionOutput = [kilo, fiveK, tenK]; // Store the successful combination.
        isCombinationFound = true; // Set flag to true to trigger early exits.
        break; // Exit the 'fiveK' loop as a solution is found.
      }
    }
  }

  // Format the final output as a space-separated string of the bill counts.
  return solutionOutput.join(' ');
};

// Entry point for executing the banknote combination solver.
// Reads input from standard input and prints the result.
const executeBillSolver = () => {
  try {
    // Read the entire content from standard input, assuming UTF-8 encoding.
    const stdInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function with the read content.
    const computedResult = findBanknoteCombination(stdInputContent);
    // Output the result to the console.
    console.log(computedResult);
  } catch (executionError) {
    // Handle potential errors during file reading or processing.
    console.error("An error occurred during input processing:", executionError.message);
    // In case of an error, output the default failure string.
    console.log("-1 -1 -1");
  }
};

// Invoke the execution function to start the process.
executeBillSolver();