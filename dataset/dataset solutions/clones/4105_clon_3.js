'use strict';

/**
 * A utility function to output the final bill counts.
 * It encapsulates the console.log operation for consistency.
 * @param {number} count10k - Number of 10000-yen bills.
 * @param {number} count5k - Number of 5000-yen bills.
 * @param {number} count1k - Number of 1000-yen bills.
 */
const outputBillCounts = (count10k, count5k, count1k) => {
  console.log(count10k, count5k, count1k);
};

/**
 * Solves a Japanese money puzzle to find a specific combination of bills.
 * Given a total number of bills (N) and a target total sum (Y),
 * this function attempts to find non-negative integer counts for
 * 10000-yen, 5000-yen, and 1000-yen bills that satisfy both conditions.
 *
 * @param {string} rawInputString - A string containing two space-separated
 *                                  numeric values: total bills (N) and target sum (Y).
 */
function determineBillCombination(rawInputString) {
  // Define symbolic constants for bill denominations to improve readability and maintainability.
  const VALUE_OF_TEN_THOUSAND = 10000;
  const VALUE_OF_FIVE_THOUSAND = 5000;
  const VALUE_OF_ONE_THOUSAND = 1000;

  // Define a constant for indicating that no valid solution was found.
  const NO_SOLUTION_FOUND = -1;

  // --- Input Processing and Initial Validation (Type III additions) ---
  // Trim whitespace and split the input string by one or more spaces.
  const inputTokens = rawInputString.trim().split(/\s+/);

  // Validate the number of input tokens.
  if (inputTokens.length !== 2) {
    // If input format is incorrect, return the no-solution indicator.
    return outputBillCounts(NO_SOLUTION_FOUND, NO_SOLUTION_FOUND, NO_SOLUTION_FOUND);
  }

  // Parse the string tokens into integer values.
  const totalBillsExpected = parseInt(inputTokens[0], 10);
  const targetTotalYen = parseInt(inputTokens[1], 10);

  // Validate parsed numerical values.
  if (isNaN(totalBillsExpected) || isNaN(targetTotalYen) || totalBillsExpected < 0 || targetTotalYen < 0) {
    // If values are not valid numbers or are negative, return no-solution.
    return outputBillCounts(NO_SOLUTION_FOUND, NO_SOLUTION_FOUND, NO_SOLUTION_FOUND);
  }

  // --- Main Logic: Iterative Search for Bill Combinations ---
  // Outer loop: Iterate through all possible counts for 10000-yen bills.
  // 'countOf10k' represents the number of 10000-yen bills.
  for (let countOf10k = 0; countOf10k <= totalBillsExpected; countOf10k++) {
    // Calculate the remaining monetary sum after considering the 10000-yen bills.
    let currentYenBalance = targetTotalYen - (VALUE_OF_TEN_THOUSAND * countOf10k);

    // --- Early Exit & Optimization for 10k Bills (Type III update) ---
    // If the current balance is negative, it means we've overshot the target sum
    // with 10k bills alone. Further increasing countOf10k will only worsen this.
    if (currentYenBalance < 0) {
      break; // Exit the outer loop.
    }

    // If the current balance is exactly zero:
    if (currentYenBalance === 0) {
      // If using only 10k bills, we've also matched the total bill count.
      if (countOf10k === totalBillsExpected) {
        return outputBillCounts(countOf10k, 0, 0); // Found solution: all 10k bills, no 5k or 1k.
      } else {
        // If balance is zero but we still need more bills (countOf10k < totalBillsExpected),
        // it's impossible to add more bills without increasing the sum (which is already zero).
        // Therefore, this path won't lead to a solution for the current countOf10k or higher.
        break; // Exit the outer loop.
      }
    }

    // Calculate the number of bills that must be made up by 5000-yen and 1000-yen bills.
    const remainingBillSlots = totalBillsExpected - countOf10k;

    // Inner loop: Iterate through all possible counts for 5000-yen bills.
    // 'countOf5k' represents the number of 5000-yen bills.
    // It cannot exceed the 'remainingBillSlots'.
    for (let countOf5k = 0; countOf5k <= remainingBillSlots; countOf5k++) {
      // The count of 1000-yen bills is determined by the remaining slots.
      const countOf1k = remainingBillSlots - countOf5k;

      // Calculate the total monetary value contributed by 5000-yen and 1000-yen bills.
      const sumFromLowerDenominations = (VALUE_OF_FIVE_THOUSAND * countOf5k) + (VALUE_OF_ONE_THOUSAND * countOf1k);

      // Check if this sum exactly matches the current remaining balance.
      if (sumFromLowerDenominations === currentYenBalance) {
        return outputBillCounts(countOf10k, countOf5k, countOf1k); // Solution found!
      }

      // --- Inner Loop Optimization (Type III update/rewrite) ---
      // Calculate the difference between the required current balance and what lower denominations provide.
      const monetaryDifference = currentYenBalance - sumFromLowerDenominations;

      // If the difference is not zero (meaning not a solution) AND
      // the difference is less than the value of a 1000-yen bill,
      // it implies that we cannot achieve the exact currentYenBalance by adjusting
      // the 5k and 1k bills further for this 'countOf10k'.
      // This covers cases where we've overshot (negative difference) or
      // undershot by an amount too small to be made up by 1000-yen bills.
      if (monetaryDifference !== 0 && monetaryDifference < VALUE_OF_ONE_THOUSAND) {
          break; // Exit the inner loop.
      }
    }
  }

  // If the loops complete without finding any valid combination,
  // output the no-solution indicator.
  return outputBillCounts(NO_SOLUTION_FOUND, NO_SOLUTION_FOUND, NO_SOLUTION_FOUND);
}

// The main execution block: reads input from standard input (file descriptor 0)
// using Node.js 'fs' module and passes it to the puzzle solver function.
determineBillCombination(require('fs').readFileSync(0, 'utf8'));