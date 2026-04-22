// This function serves as the primary entry point for calculating investment growth periods.
// It takes raw input data, typically from a standard input stream, to determine
// how many compounding periods are required for an initial capital to reach a specified target.
function calculateInvestmentYears(rawInputData) {

  // Define crucial financial parameters as constants for clarity and maintainability.
  const BASE_CAPITAL = 100; // The starting amount of the investment.
  const ANNUAL_INTEREST_FACTOR = 1.01; // Represents a 1% annual growth rate (1 + 0.01).

  // It's essential to convert the raw input, which is often a string, into a numerical value.
  // This numerical value represents the financial target that the investment aims to reach or exceed.
  const targetFinancialGoal = Number(rawInputData);

  // Initialize the current state of the investment balance with the base capital.
  let currentInvestmentValue = BASE_CAPITAL;

  // Initialize a counter to track the number of full periods (e.g., years) that have passed.
  let numberOfPeriods = 0;

  // --- Introduction of an early exit condition (Type III addition) ---
  // If the target goal is already less than or equal to the initial capital,
  // no growth periods are needed. This handles edge cases efficiently.
  if (targetFinancialGoal <= BASE_CAPITAL) {
    console.log(0); // Output 0 periods if the goal is already met or surpassed.
    return; // Terminate function execution early.
  }
  // --- End of early exit condition ---

  // Begin a iterative process to simulate the investment's growth.
  // The loop continues as long as the current investment value has not yet reached the target goal.
  while (currentInvestmentValue < targetFinancialGoal) {
    // Apply the annual interest factor to the current balance.
    // Math.floor is used to truncate any fractional currency units, reflecting a common
    // practice in some financial calculations or to precisely match the original behavior.
    currentInvestmentValue = Math.floor(currentInvestmentValue * ANNUAL_INTEREST_FACTOR);
    
    // Increment the period counter for each cycle of growth.
    numberOfPeriods++;
  }

  // Once the loop concludes (meaning the target has been met or exceeded),
  // the total count of periods elapsed is outputted to the console.
  console.log(numberOfPeriods);
}

// This section handles the execution environment's input/output mechanism.
// It reads all data from standard input (typically `/dev/stdin` in Unix-like systems),
// decodes it as UTF-8, and then passes this processed input string to our
// `calculateInvestmentYears` function for computation.
calculateInvestmentYears(require("fs").readFileSync("/dev/stdin", "utf8"));