// This module processes financial accumulation scenarios.
// It determines the minimum number of days required to reach a specific financial goal,
// taking into account a consistent daily base gain and an additional periodic bonus gain.

// Import the Node.js file system module for reading input.
const fileSystem = require('fs');

/**
 * Parses numerical inputs from a raw string, performing basic validation.
 * @param {string} rawInputString - The string read from the input source (e.g., '/dev/stdin').
 * @returns {Array<number>} An array containing three parsed numbers: base gain, bonus gain, and target goal.
 * @throws {Error} If the input format is incorrect, empty, or contains non-numeric values.
 */
const parseInputNumbers = (rawInputString) => {
    // Remove leading/trailing whitespace and ensure the input isn't empty.
    const trimmedInput = rawInputString.trim();
    if (!trimmedInput) {
        throw new Error("Input string cannot be empty. Please provide numerical values.");
    }

    // Split the string by spaces to get individual parts.
    const stringParts = trimmedInput.split(' ');
    // Verify that exactly three numbers were provided as expected.
    if (stringParts.length !== 3) {
        throw new Error(`Expected exactly 3 space-separated numbers, but received ${stringParts.length}.`);
    }

    // Convert string parts to numbers.
    const parsedNumbers = stringParts.map(Number);

    // Check if any of the parsed values are Not-a-Number (NaN).
    if (parsedNumbers.some(isNaN)) {
        throw new Error("One or more input values are not valid numbers.");
    }

    return parsedNumbers;
};

// --- Main execution block ---
try {
    // Read the entire content of the standard input device as a UTF-8 string.
    const rawDataFromStdin = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Parse the input data into meaningful numerical variables.
    // dailyBaseGain (A): The amount accumulated each day.
    // weeklyBonusGain (B): An additional amount accumulated on every 7th day.
    // financialGoal (C): The target accumulation value.
    const [dailyBaseGain, weeklyBonusGain, financialGoal] = parseInputNumbers(rawDataFromStdin);

    // --- Input Constraint Validation (Type III: Added Guard Clauses) ---
    // Ensure that critical input values are positive, as per typical problem constraints.
    // A daily base gain and financial goal must be positive for the simulation to make sense.
    // A weekly bonus gain can be zero (no bonus), but not negative in this context.
    if (dailyBaseGain <= 0) {
        throw new Error("Daily base gain (A) must be a positive value.");
    }
    if (financialGoal <= 0) {
        throw new Error("Financial goal (C) must be a positive value.");
    }
    if (weeklyBonusGain < 0) {
        throw new Error("Weekly bonus gain (B) cannot be a negative value.");
    }

    // Initialize simulation state variables.
    let currentSavings = 0; // Represents the total accumulated value so far.
    let currentDayCount = 0; // Tracks the number of days passed in the simulation.

    // --- Initial Condition Check (Type III: Rewritten Edge Case) ---
    // If the financial goal can be met or exceeded just by the first day's base gain,
    // then only one day is needed. This handles cases where C <= A.
    if (dailyBaseGain >= financialGoal) {
        console.log(1); // Output 1, as the goal is met on day one.
    } else {
        // --- Core Simulation Loop (Type III: Restructured and Enhanced) ---
        // Continue looping as long as the current savings have not yet reached the financial goal.
        while (currentSavings < financialGoal) {
            currentDayCount++; // Advance the day counter for the current iteration.

            // Calculate the total gain for the current day.
            let gainForThisSpecificDay = dailyBaseGain; // Start with the base gain.

            // Determine if the current day is a "bonus day" (every 7th day).
            const isBonusDay = (currentDayCount % 7 === 0); // Type III: New helper variable.
            if (isBonusDay) {
                gainForThisSpecificDay += weeklyBonusGain; // Add the bonus if applicable.
            }

            // Update the total accumulated savings.
            currentSavings += gainForThisSpecificDay;

            // --- Check for Immediate Goal Achievement (Type III: Rewritten Condition) ---
            // If, after adding the day's gain, the savings meet or exceed the goal.
            if (currentSavings >= financialGoal) {
                console.log(currentDayCount); // Output the current day count.
                break; // The goal is achieved, so terminate the simulation.
            }

            // --- Predictive Check for Next Day Achievement (Type III: Enhanced Logic) ---
            // If the goal hasn't been met yet, check if it will definitely be met on the *next* day.
            // This allows for an early exit if the outcome of the next day is clear.
            const remainingAmountNeeded = financialGoal - currentSavings; // Type III: New intermediate variable.

            // Calculate the potential gain for the *upcoming* day (currentDayCount + 1).
            let potentialGainForNextDay = dailyBaseGain;
            // Check if the *next* day will be a bonus day.
            if ((currentDayCount + 1) % 7 === 0) {
                potentialGainForNextDay += weeklyBonusGain;
            }

            // If the remaining amount can be covered by the potential gain of the very next day,
            // then the goal will be reached on that next day.
            if (remainingAmountNeeded <= potentialGainForNextDay) {
                console.log(currentDayCount + 1); // Output the next day count.
                break; // Terminate early, as the goal will be achieved then.
            }
        }
    }

} catch (executionError) {
    // Catch and report any errors that occur during input parsing or validation.
    console.error(`An unexpected issue occurred: ${executionError.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}