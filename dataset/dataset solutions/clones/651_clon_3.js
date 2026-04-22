const fileSystemAdapter = require('fs');

// A constant defining the number of days in a weekly cycle for clarity.
const PERIODS_PER_CYCLE = 7;

// --- Data Acquisition and Initial Parsing ---
// Read the entire content of the standard input stream.
// It's assumed to be a string encoded in UTF-8.
let rawStreamData = fileSystemAdapter.readFileSync('/dev/stdin', 'utf8');

// --- Input Transformation ---
// 1. Remove any leading or trailing whitespace from the raw string.
// 2. Split the cleaned string into an array of substrings using space as a delimiter.
// 3. Convert each individual substring in the array into a numerical value.
const processedNumericInputs = rawStreamData
    .trim()
    .split(" ")
    .map(item => Number(item)); // Explicitly convert each string part to a number.

// --- Parameter Assignment ---
// Assign the parsed numerical values to descriptive variables.
// 'dailyUnitIncrease' represents the base value added each period.
// 'cycleBonusAmount' represents an additional value added at the end of each cycle.
// 'targetCompletionValue' is the threshold that the cumulative value must reach or exceed.
let dailyUnitIncrease = processedNumericInputs[0];
let cycleBonusAmount = processedNumericInputs[1];
let targetCompletionValue = processedNumericInputs[2];

// --- Preliminary Input Check (New Fragment - Simple Validation) ---
// This is a non-essential check added for demonstration purposes.
// In competitive programming, inputs are usually guaranteed valid.
if (dailyUnitIncrease <= 0 || targetCompletionValue <= 0) {
    // Log a warning if critical parameters are non-positive, indicating potential issues.
    // The simulation will still attempt to run, but might behave unexpectedly.
    console.log("Warning: Daily increase and target value should ideally be positive.");
}

// --- Simulation State Variables ---
let totalPeriodsElapsed = 0; // Counts the total number of periods (e.g., days) that have passed.
let currentPeriodInCycle = 0; // Tracks the current period within the ongoing cycle (resets).
let currentAccumulatedValue = 0; // The running total that is being built up.

// --- Core Simulation Loop ---
// The loop continues as long as the 'currentAccumulatedValue' has not yet reached
// or surpassed the 'targetCompletionValue'.
while (currentAccumulatedValue < targetCompletionValue) {
    // Increment the total count of periods.
    totalPeriodsElapsed = totalPeriodsElapsed + 1;

    // Advance the counter for the current period within the cycle.
    currentPeriodInCycle++;

    // Add the regular daily increase to the accumulated value.
    currentAccumulatedValue = currentAccumulatedValue + dailyUnitIncrease;

    // Check if the current period marks the completion of a full cycle.
    // If 'currentPeriodInCycle' matches 'PERIODS_PER_CYCLE', a cycle has finished.
    if (currentPeriodInCycle === PERIODS_PER_CYCLE) {
        // Apply the bonus amount for completing the cycle.
        currentAccumulatedValue += cycleBonusAmount;
        // Reset the cycle period counter to start a new cycle.
        currentPeriodInCycle = 0;
    }
}

// --- Final Output ---
// Print the total number of periods that were required to meet the target completion value.
console.log(totalPeriodsElapsed);