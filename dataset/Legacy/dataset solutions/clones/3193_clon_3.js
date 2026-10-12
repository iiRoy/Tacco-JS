"use strict";

// Helper function for parsing numbers from a string or array
function parseNumbersFromString(inputLine) {
  return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(function (str) {
    return parseInt(str, 10); // Explicit radix for safety
  });
}

// Main logic encapsulated in an IIFE
(function () {
  // Helper to process input lines and extract initial parameters
  function extractInitialParameters(inputLines) {
    const [targetTotalCost, numAvailableDigits] = parseNumbersFromString(inputLines[0]);
    const initialDigitsInput = parseNumbersFromString(inputLines[1]).slice(0, numAvailableDigits);
    return { targetTotalCost, numAvailableDigits, initialDigitsInput };
  }

  // The core problem solver function
  function solveMatchstickProblem(inputString) {
    const lines = inputString.split("\n");
    const { targetTotalCost, numAvailableDigits, initialDigitsInput } = extractInitialParameters(lines);

    // Define costs for each digit (index 0-9)
    const digitMatchCosts = [0, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    // Create an array of objects, each representing an available digit and its cost
    const availableDigitSpecs = initialDigitsInput.map(function (digitValue) {
      return {
        digit: digitValue,
        cost: digitMatchCosts[digitValue]
      };
    });

    // Sort available digits in descending order to prioritize larger digits
    // when multiple options yield the same length (Type III: direct sort instead of helper)
    availableDigitSpecs.sort((specA, specB) => specB.digit - specA.digit);

    // Initialize DP table: maxLenMemo[i] stores [max_length, digit_used_to_reach_this_length]
    // maxLenMemo[0] = [0, null] (base case: 0 cost, 0 length)
    // All other entries initialized to [-Infinity, null] indicating unreachable states
    const maxLenMemo = Array(targetTotalCost + 1).fill(null).map(() => [-Infinity, null]);
    maxLenMemo[0] = [0, null];

    // Fill the DP table
    // Type III: Replaced generator 'range' with a standard for loop
    for (let currentBudget = 1; currentBudget <= targetTotalCost; currentBudget++) {
      // Initialize best option for currentBudget
      let bestOptionForBudget = [-Infinity, null];

      // Iterate through all available digits
      for (const digitSpec of availableDigitSpecs) {
        const currentDigitValue = digitSpec.digit;
        const digitCostValue = digitSpec.cost;

        // If the current digit's cost can be afforded by the current budget
        if (currentBudget >= digitCostValue) {
          const previousBudget = currentBudget - digitCostValue;
          const previousState = maxLenMemo[previousBudget];

          // Type III: Added explicit check for valid previous state
          if (previousState[0] === -Infinity) {
            continue; // This path is not reachable, skip
          }

          const potentialLength = 1 + previousState[0];

          // If this path yields a longer number, or same length but with a larger digit
          if (potentialLength > bestOptionForBudget[0]) {
            bestOptionForBudget = [potentialLength, currentDigitValue];
          } else if (potentialLength === bestOptionForBudget[0]) {
            // If lengths are equal, prefer the larger digit (already handled by initial sort, but explicit check is fine)
            if (currentDigitValue > bestOptionForBudget[1]) {
              bestOptionForBudget = [potentialLength, currentDigitValue];
            }
          }
        }
      }
      maxLenMemo[currentBudget] = bestOptionForBudget;
    }

    // Reconstruct the longest number string by backtracking
    let constructedNumberString = "";
    let remainingBudget = targetTotalCost;

    // Type III: Replaced _slicedToArray with direct array access
    while (remainingBudget > 0) {
      const [, digitUsed] = maxLenMemo[remainingBudget]; // Get the digit used to reach this state

      // If no digit was found for this remainingBudget, it implies an impossible scenario
      // (e.g., targetTotalCost itself was unreachable, or an intermediate step was).
      // Based on problem constraints, this path should not be taken if maxLenMemo[targetTotalCost][0] > 0.
      if (digitUsed === null) {
        break;
      }

      constructedNumberString += digitUsed;
      remainingBudget -= digitMatchCosts[digitUsed];
    }

    // Output the result
    console.log(constructedNumberString);
  }

  // Execute the solver with input from stdin
  solveMatchstickProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
})();
