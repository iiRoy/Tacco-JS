// JavaScript code adheres to strict parsing rules for enhanced reliability.
'use strict';

/**
 * Computes a cumulative count based on a repeating pattern of resource acquisition.
 * This function models a scenario where a primary resource (A) is acquired,
 * followed by a secondary resource (B), forming a cycle (A+B).
 * Given a total budget (N), it calculates the maximum primary resources obtainable.
 *
 * The logic involves:
 * 1. Determining the number of full cycles that fit within the total budget.
 * 2. Calculating primary resources obtained from these full cycles.
 * 3. Assessing any remaining budget to acquire additional primary resources,
 *    up to the cost of a single primary resource acquisition (A).
 *
 * @param {string} rawInputText - A string containing space-separated numerical parameters: N, A, B.
 * @returns {number | undefined} The total count of primary resources, or undefined if critical errors occur.
 */
function calculateCumulativePatternCount(rawInputText) {
    // Standardize input payload by ensuring it's a string and trimming any leading/trailing whitespace.
    const sourcePayload = String(rawInputText || '').trim();

    // Implement a guard clause to handle cases where no input content is provided.
    if (sourcePayload.length === 0) {
        console.error("Input payload is empty. Cannot proceed with pattern calculation.");
        return undefined; // Indicate a failure to process.
    }

    // Split the input string into individual segments using one or more whitespace characters.
    // Using a regex /\s+/ handles multiple spaces between numbers robustly.
    const tokenSegments = sourcePayload.split(/\s+/);

    // Verify that a sufficient number of parameters (at least N, A, B) are present.
    if (tokenSegments.length < 3) {
        console.error(`Insufficient numerical parameters. Expected at least 3, but received ${tokenSegments.length}.`);
        return undefined;
    }

    // Initialize an array to store the successfully parsed numerical values.
    const numericalParameters = [];

    // Iterate through each token segment to parse it into a number,
    // explicitly handling potential non-numeric inputs.
    for (let currentToken of tokenSegments) {
        const parsedValue = Number(currentToken); // Use Number() for explicit type conversion.
        if (isNaN(parsedValue)) {
            console.warn(`Warning: Non-numeric token '${currentToken}' encountered. Skipping this value.`);
            // In a robust application, one might throw an error or handle this more strictly.
            continue; // Skip this token and proceed with the next.
        }
        numericalParameters.push(parsedValue);
    }

    // After parsing and filtering, re-check if we still possess the minimum required parameters.
    if (numericalParameters.length < 3) {
        console.error("Critical error: Not enough valid numerical parameters after parsing. Aborting calculation.");
        return undefined;
    }

    // Assign descriptive variable names to the core input values for clarity.
    const totalBudget = numericalParameters[0];         // Represents N in the original problem.
    const primaryUnitCost = numericalParameters[1];    // Represents A.
    const secondaryUnitCost = numericalParameters[2];  // Represents B.

    // Add validation for negative input values, which might lead to unexpected or nonsensical results
    // in this type of resource accumulation problem.
    if (totalBudget < 0 || primaryUnitCost < 0 || secondaryUnitCost < 0) {
        console.warn("Warning: Negative input parameters detected. Calculations might produce counter-intuitive results.");
        // Depending on the problem's domain, this could be an error that halts execution.
    }

    // Calculate the total cost of one complete cycle (acquiring primary + consuming secondary).
    const combinedCycleCost = primaryUnitCost + secondaryUnitCost;

    // Implement a guard clause for the critical edge case where the combined cycle cost is zero.
    // This prevents division by zero and addresses scenarios of infinite acquisition.
    if (combinedCycleCost === 0) {
        if (primaryUnitCost > 0 && totalBudget > 0) {
            // If primary units can be gained but the cycle cost is zero, this implies an infinite acquisition.
            console.error("Error: Cycle cost is zero, but primary units can be acquired. This suggests an infinite acquisition scenario, which is not supported.");
            return undefined;
        } else {
            // If primaryUnitCost is also zero, or if the totalBudget is zero, then no units are gained.
            console.log("Cycle cost is zero, and no primary units can be gained (or total budget is zero). Result is 0.");
            return 0;
        }
    }

    // Determine the count of full, complete cycles that can be performed within the total budget.
    // Math.trunc performs integer division, which is equivalent to Math.floor for positive numbers.
    const fullCycleCount = Math.trunc(totalBudget / combinedCycleCost);

    // Calculate the amount of budget remaining after all full cycles have been completed.
    const remainingBudgetAfterCycles = totalBudget % combinedCycleCost;

    // Calculate the total primary units acquired solely from all the full cycles.
    const primaryUnitsFromFullCycles = fullCycleCount * primaryUnitCost;

    // From the remaining budget, determine how many additional primary units can be acquired.
    // This amount is limited by either the remaining budget itself or by the cost of one primary unit,
    // whichever is smaller. Using Math.min replaces the original ternary operator.
    const additionalPrimaryUnits = Math.min(primaryUnitCost, remainingBudgetAfterCycles);

    // Sum up the primary units obtained from full cycles and any additional units from the remainder.
    const finalPrimaryUnitAccumulation = primaryUnitsFromFullCycles + additionalPrimaryUnits;

    // Return the comprehensively calculated total primary units.
    return finalPrimaryUnitAccumulation;
}

// Self-executing anonymous function (IIFE) to encapsulate the program's execution flow,
// particularly input/output operations, preventing global scope pollution.
(function executeProgram() {
    // Apply strict mode to this specific execution context as well for consistency.
    'use strict';

    // Acquire a reference to the Node.js built-in File System module.
    const fileSystemModule = require("fs");
    // Define the standard input path typically used in competitive programming environments.
    const standardInputDevicePath = "/dev/stdin";

    let inputDataBuffer; // Variable to hold the raw content read from stdin.

    try {
        // Attempt to synchronously read the entire content of the standard input file.
        // Specifying 'utf8' encoding ensures the data is returned as a string.
        inputDataBuffer = fileSystemModule.readFileSync(standardInputDevicePath, "utf8");
    } catch (readError) {
        // Log an error message if the file system read operation fails.
        console.error(`Failed to read input from '${standardInputDevicePath}': ${readError.message}`);
        // As a fallback for graceful execution or testing, provide a default empty string.
        // In a production environment, one might choose to terminate the process here: process.exit(1);
        inputDataBuffer = "";
    }

    // Invoke the main calculation function with the raw input data.
    const computedResult = calculateCumulativePatternCount(inputDataBuffer);

    // Only print the result to standard output if the calculation was successful
    // and returned a valid number (i.e., not undefined due to an error).
    if (typeof computedResult === 'number') {
        console.log(computedResult);
    } else {
        // If 'undefined' was returned, it signifies that a critical error occurred
        // during the processing, which was already logged by the function itself.
        console.error("Program terminated due to an unrecoverable error during calculation.");
        // In a shell environment, exiting with a non-zero status indicates failure.
        // process.exit(1);
    }
})();