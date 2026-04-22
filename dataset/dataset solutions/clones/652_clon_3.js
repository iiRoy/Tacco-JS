// This script calculates the number of days required to reach a specific target value.
// It simulates a daily accumulation process with a base daily gain and a periodic weekly bonus.

// Define constants for file system operations and input parsing.
const FILE_SYSTEM_MODULE = require('fs'); // Core Node.js module for file system interactions.
const INPUT_SOURCE_PATH = '/dev/stdin';   // Standard input file path, common in competitive programming environments.
const DECIMAL_RADIX = 10;                 // Specifies base 10 for integer parsing.

// Attempt to read the entire content of the specified input file synchronously.
// The content is assumed to be encoded in UTF-8.
let rawInputDataString = FILE_SYSTEM_MODULE.readFileSync(INPUT_SOURCE_PATH, 'utf8');

// Pre-process the raw input string to extract numeric parameters:
// 1. trim(): Removes any leading or trailing whitespace characters.
// 2. split(' '): Divides the string into an array of substrings, using a space as the delimiter.
// 3. map(elementString => ...): Transforms each string element into a numeric value.
let parsedNumericParameters = rawInputDataString
                                .trim()
                                .split(' ')
                                .map(elementString => {
                                    // Parse each string element into an integer.
                                    const convertedValue = parseInt(elementString, DECIMAL_RADIX);

                                    // Implement basic input validation:
                                    // If parseInt results in NaN (Not a Number), it indicates invalid input.
                                    if (isNaN(convertedValue)) {
                                        // Output an error message to the console's error stream.
                                        console.error(`RUNTIME ERROR: Encountered non-numeric input: "${elementString}". Program requires valid integers.`);
                                        // Terminate the process with an error code.
                                        process.exit(1);
                                    }
                                    return convertedValue;
                                });

// Destructure the array of parsed numeric parameters into distinct, semantically named variables.
// These represent the core input values for the simulation.
let [
    dailyBaseGain,        // The constant amount added to the total each day.
    periodicBonusAmount,  // The additional amount added at the end of every week.
    targetThreshold       // The target accumulated value that needs to be reached or exceeded.
] = parsedNumericParameters;

// Define a constant for the duration of a week, enhancing code readability.
const DAYS_PER_PERIOD = 7;

// Initialize simulation state variables.
let currentDayCount = 0;          // A counter for the number of elapsed days, starting from zero.
let accumulatedValueTotal = 0;    // The running total of accumulated value, initialized to zero.

// Implement an early exit condition (guard clause) for trivial cases.
// If the target threshold is non-positive, or can be met on the very first day
// (i.e., target is less than or equal to the daily base gain), output '1' and terminate.
// This matches the original logic where if 'c <= a', it prints 1.
if (targetThreshold <= 0 || targetThreshold <= dailyBaseGain) {
    console.log(1);
    return; // Exits the script's execution.
}

// Begin the primary simulation loop using a do-while construct.
// This ensures that the loop body executes at least once before checking the condition.
do {
    // Increment the day counter by one for the current iteration.
    currentDayCount = currentDayCount + 1;

    // Add the daily base gain to the accumulating total.
    accumulatedValueTotal = accumulatedValueTotal + dailyBaseGain;

    // Check if the current day marks the end of a full period (a week).
    // The modulo operator (%) determines if currentDayCount is a multiple of DAYS_PER_PERIOD.
    const isPeriodicMilestone = (currentDayCount % DAYS_PER_PERIOD) === 0;

    // If it's a periodic milestone, apply the additional bonus amount.
    if (isPeriodicMilestone) {
        accumulatedValueTotal = accumulatedValueTotal + periodicBonusAmount;
    }

// The loop continues as long as the accumulated value has not yet reached the target threshold.
} while (accumulatedValueTotal < targetThreshold);

// Once the loop terminates, it means the targetThreshold has been met or surpassed.
// Output the final day count required to achieve this goal.
console.log(currentDayCount);