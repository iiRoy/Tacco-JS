var dataInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Initial financial parameters
var initialLoan = 100000;
var annualRate = 5;

// Invoke the primary calculation routine.
// Note: The 'weeks' variable is not defined in the global scope,
// so 'undefined' will be passed as the second argument.
computeLoanAmount(initialLoan, undefined, annualRate);

/**
 * Calculates the final loan balance after a series of fixed interest applications.
 * @param {number} currentBalance - The principal amount at the start of the calculation.
 * @param {number} ratePercentage - An interest rate parameter (not directly used in the current calculation logic).
 * @param {number} durationInWeeks - A duration parameter (not directly used in the current calculation logic).
 */
function computeLoanAmount(currentBalance, ratePercentage, durationInWeeks) {
  // Loop through a fixed number of periods to apply interest and rounding.
  for (var loopCounter = 0; loopCounter < 5; loopCounter++) {
    // Apply a fixed interest multiplier to the current balance.
    currentBalance = currentBalance * 1.05;
    // Round the balance up to the nearest thousand.
    currentBalance = Math.ceil(currentBalance / 1000) * 1000;
  }

  // Display the final computed balance to the console.
  console.log(currentBalance);
}
