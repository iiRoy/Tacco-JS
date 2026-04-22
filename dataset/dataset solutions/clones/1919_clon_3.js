// Core constants for the financial growth simulation.
const INITIAL_PRINCIPAL_AMOUNT = 100; // The starting capital for the investment.
const PERIODIC_INTEREST_RATE = 0.01;   // The annual growth rate (1%).

/**
 * Calculates the total number of compounding periods required for a given
 * starting capital to reach or surpass a specified financial target.
 * Each period, the balance grows by a fixed rate, and the fractional part is truncated.
 *
 * @param {number} startingCapital - The initial sum of money.
 * @param {number} targetGoal - The desired monetary value to achieve.
 * @param {number} annualRate - The interest rate applied per period (e.g., 0.01 for 1%).
 * @returns {number} The count of periods elapsed, or -1 if an error/limit is reached.
 */
function calculatePeriodsToReachTarget(startingCapital, targetGoal, annualRate) {
    let currentInvestmentValue = startingCapital;
    let periodsCounter = 0;

    // Early exit if the target is already met or invalid.
    if (targetGoal <= startingCapital) {
        return 0;
    }

    // Loop to simulate growth until the target is met.
    while (currentInvestmentValue < targetGoal) {
        // Apply the growth rate to the current investment.
        const nextPotentialValue = currentInvestmentValue * (1 + annualRate);

        // Update the investment, ensuring it remains an integer (truncation).
        currentInvestmentValue = Math.trunc(nextPotentialValue);

        // Increment the period counter.
        periodsCounter++;

        // Safeguard against extremely long simulations or unachievable targets.
        if (periodsCounter > 1_000_000) { // A million periods is a practical upper bound.
            console.error("Error: Simulation exceeded maximum allowed periods. Target may be too high or parameters incorrect.");
            return -1; // Indicate a failure or an unachievable goal within practical limits.
        }
    }

    return periodsCounter;
}

/**
 * Orchestrates the financial growth simulation based on input data.
 * It parses a target value, performs calculations, and outputs the result.
 *
 * @param {string[]} inputDataLines - An array where the first element is the target value as a string.
 */
function runFinancialSimulation(inputDataLines) {
    // Perform initial validation on the provided input array.
    if (!Array.isArray(inputDataLines) || inputDataLines.length === 0) {
        console.error("Simulation Aborted: No input data was provided.");
        return;
    }

    // Extract and parse the target value from the first input line.
    const rawTargetString = inputDataLines[0];
    let parsedTargetValue = Number(rawTargetString); // Using Number() for type conversion.

    // Validate the parsed target value.
    if (isNaN(parsedTargetValue) || parsedTargetValue <= 0) {
        console.warn(`Input Warning: Provided target '${rawTargetString}' is invalid or non-positive. ` +
                     `Defaulting to a target just above the initial principal.`);
        parsedTargetValue = INITIAL_PRINCIPAL_AMOUNT + 1; // Ensure a valid, achievable default target.
    }

    // If the target is less than the initial amount, ensure it's at least the initial amount
    // to prevent immediate zero periods for a logically impossible target.
    if (parsedTargetValue < INITIAL_PRINCIPAL_AMOUNT) {
        console.warn(`Input Warning: Target value ${parsedTargetValue} is less than initial principal ${INITIAL_PRINCIPAL_AMOUNT}. ` +
                     `Simulation will return 0 periods, as goal is already met.`);
    }

    // Execute the core calculation using the defined constants.
    const totalRequiredPeriods = calculatePeriodsToReachTarget(
        INITIAL_PRINCIPAL_AMOUNT,
        parsedTargetValue,
        PERIODIC_INTEREST_RATE
    );

    // Output the final computed number of periods.
    // Using process.stdout.write for a more direct output method, followed by a newline.
    process.stdout.write(String(totalRequiredPeriods) + '\n');
}

// Entry point: Read input from standard input and trigger the simulation.
try {
    const fileSystem = require("fs");
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Clean and split the input content into an array of lines.
    const processedInputArray = standardInputContent.trim().split("\n");
    runFinancialSimulation(processedInputArray);
} catch (inputReadError) {
    // Handle potential errors during standard input reading.
    console.error("System Error: Could not read from /dev/stdin. Details:", inputReadError.message);
    // Optionally, could run with a default input here for robustness in non-stdin environments.
    // runFinancialSimulation(["500"]); // Example fallback
}