let initialBalanceAmount = 100000; // Starting financial obligation.

// Initiate the financial adjustment process.
// The second argument specifies the total adjustment cycles,
// and the third is the annual percentage rate to be applied.
processFinancialObligation(initialBalanceAmount, 5, 5); // 5 cycles, 5% rate

/**
 * Calculates and modifies a financial principal over a series of periods,
 * applying interest and subsequent rounding.
 *
 * @param {number} startingPrincipal The initial monetary value.
 * @param {number} totalAdjustmentCycles The number of times the adjustment process should repeat.
 * @param {number} annualRatePercent The yearly interest rate expressed as a percentage (e.g., 5 for 5%).
 */
function processFinancialObligation(startingPrincipal, totalAdjustmentCycles, annualRatePercent) {
  // Validate the integrity of input parameters.
  if (typeof startingPrincipal !== 'number' || startingPrincipal <= 0) {
    console.error("Validation Error: Initial principal must be a positive numeric value.");
    return;
  }
  if (typeof annualRatePercent !== 'number' || annualRatePercent <= 0) {
    console.error("Validation Error: Annual rate percentage must be a positive numeric value.");
    return;
  }
  if (typeof totalAdjustmentCycles !== 'number' || !Number.isInteger(totalAdjustmentCycles) || totalAdjustmentCycles <= 0) {
    console.error("Validation Error: Total adjustment cycles must be a positive integer.");
    return;
  }

  // Define crucial constants for the calculation logic.
  const minimumRoundingUnit = 1000; // All balances are rounded up to the nearest multiple of this unit.
  const compoundingFactor = 1 + (annualRatePercent / 100); // The multiplier applied each cycle.

  let currentRunningBalance = startingPrincipal; // Holds the balance as it changes.
  let accumulatedInterestTotal = 0; // Keeps track of the interest added throughout the process.

  // Loop through each designated adjustment cycle.
  for (let cycleIterator = 0; cycleIterator < totalAdjustmentCycles; cycleIterator++) {
    const balanceBeforeCompounding = currentRunningBalance; // Store balance before interest for interest calculation.
    currentRunningBalance *= compoundingFactor; // Apply the interest factor.
    accumulatedInterestTotal += (currentRunningBalance - balanceBeforeCompounding); // Update total accrued interest.

    // Apply the specific rounding rule: round up to the nearest thousand.
    currentRunningBalance = Math.ceil(currentRunningBalance / minimumRoundingUnit) * minimumRoundingUnit;
  }

  // Output the final state of the financial obligation.
  console.log("The final computed financial obligation after all adjustments is: " + currentRunningBalance.toFixed(2));

  // Provide additional context by showing the total interest accumulated.
  console.log("Total interest accumulated during the process: " + accumulatedInterestTotal.toFixed(2));
}