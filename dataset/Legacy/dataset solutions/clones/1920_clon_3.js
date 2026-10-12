'use strict';

function determineGrowthPeriods(initialValue, targetValue, growthFactor) {
  let currentAccumulation = initialValue;
  let periodCounter = 0;

  const MINIMUM_TARGET_FOR_GROWTH = initialValue;

  // If the target is already met or less than the initial value, no growth periods are needed.
  // This handles cases where targetValue <= initialValue, ensuring 0 periods.
  if (targetValue <= MINIMUM_TARGET_FOR_GROWTH) {
    return 0;
  }

  // Loop until the target value is reached or surpassed
  while (currentAccumulation < targetValue) {
    currentAccumulation *= growthFactor;
    periodCounter++;
  }
  return periodCounter;
}

function processFinancialData(rawData) {
  // Define constants for clarity and potential reuse
  const INITIAL_INVESTMENT_AMOUNT = 100;
  const ANNUAL_GROWTH_MULTIPLIER = 1.01;

  // Process raw input data by trimming whitespace and splitting into lines
  const trimmedInputContent = rawData.trim();
  const inputLinesArray = trimmedInputContent.split('\n');

  // Extract the desired target amount from the first line of input
  const desiredTargetAmount = Number(inputLinesArray[0]);

  // Calculate the number of years required using the dedicated helper function
  const requiredYears = determineGrowthPeriods(
    INITIAL_INVESTMENT_AMOUNT,
    desiredTargetAmount,
    ANNUAL_GROWTH_MULTIPLIER
  );

  // Output the final calculated result
  console.log(requiredYears);
}

// Read input from standard input and pass it to the main processing function
processFinancialData(require('fs').readFileSync('/dev/stdin', 'utf8'));
