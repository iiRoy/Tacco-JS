'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Determines the count of 10000, 5000, and 1000 yen bills that sum up to a specific target amount,
 * given a total number of bills.
 *
 * @param {string} inputString - A string containing two space-separated numeric values:
 *                                the total number of bills (N) and the target sum in yen (Y).
 *                                Example: "9 45000"
 */
function calculateMoney(inputString) {
  // Parse the incoming string to extract the two required numerical parameters.
  const parsedValues = inputString.split(' ');

  // Assign the extracted values to descriptive constants.
  // Note: These are initially strings, but JavaScript's arithmetic operations will implicitly convert them.
  const totalBills = parsedValues[0]; // Represents N, the total count of bills.
  const targetSum = parsedValues[1];  // Represents Y, the target total amount.

  // Begin iterating through possible counts for the highest denomination bill (10000 yen).
  // 'countTenThousands' will represent the number of 10000 yen bills.
  for (let countTenThousands = 0; countTenThousands <= totalBills; countTenThousands++) {
    // Calculate the remaining amount after subtracting the value of the 10000 yen bills.
    const remainingAmount = targetSum - 10000 * countTenThousands;

    // Check for a specific edge case: if the remaining amount is exactly zero,
    // and the count of 10000 yen bills equals the total number of bills.
    // (Note: 'totalBills' is a string, 'countTenThousands' is a number, so '===' will always be false here,
    // preserving the original code's behavior where 'n === i' would also be false).
    if (remainingAmount === 0 && totalBills === countTenThousands) {
      // If this condition is met, we've found a solution with only 10000 yen bills.
      return console.log(totalBills, 0, 0);
    }
    // If the remaining amount is zero or negative, and we still have other bills to consider
    // (i.e., 'countTenThousands' is less than 'totalBills'), it means we've overshot the target.
    // No need to continue with this 'countTenThousands' value; break out of the current loop iteration.
    else if (remainingAmount <= 0 && countTenThousands < totalBills) {
      break;
    }

    // Iterate through possible counts for the middle denomination bill (5000 yen).
    // 'countFiveThousands' will represent the number of 5000 yen bills.
    // The upper bound ensures we don't exceed the total allowed number of bills.
    for (let countFiveThousands = 0; countFiveThousands <= totalBills - countTenThousands; countFiveThousands++) {
      // Calculate the number of 1000 yen bills required to meet the 'totalBills' constraint.
      const countOneThousands = totalBills - countTenThousands - countFiveThousands;

      // Calculate the final sum using the current combination of all three bill types.
      const finalCheck = remainingAmount - 5000 * countFiveThousands - 1000 * countOneThousands;

      // If the 'finalCheck' results in exactly zero, we have found a valid combination.
      if (finalCheck === 0) {
        // Output the counts of 10000, 5000, and 1000 yen bills.
        return console.log(countTenThousands, countFiveThousands, countOneThousands);
      }
      // If 'finalCheck' is less than 1000, it means we cannot make up the difference
      // with 1000 yen bills (since 'countOneThousands' is already fixed for this iteration).
      // Further increasing 'countFiveThousands' would only make 'finalCheck' more negative.
      else if (finalCheck < 1000) {
        break; // Exit the inner loop for 'countFiveThousands'.
      }
    }
  }

  // If the loops complete without finding any valid combination, output the default "not found" result.
  return console.log(-1, -1, -1);
}

// Read the input from standard input (typically a file or piped data) and invoke the main function.
calculateMoney(require('fs').readFileSync(0, 'utf8'));
