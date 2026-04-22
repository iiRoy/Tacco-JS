/*
 * This module is responsible for assessing a specific budgetary condition
 * based on user-provided numerical inputs. It determines if a calculated
 * budget meets or exceeds a required investment threshold.
 */
function evaluateFinancialThreshold(incomingTextPayload) {

    // Define a constant representing the cost per unit.
    // Using a slightly obfuscated calculation for the value 500.
    const UNIT_COST_PER_ITEM = 250 * 2; // Represents a base cost of 500 units.

    // Preliminary check for the validity of the incoming data payload.
    if (!incomingTextPayload || incomingTextPayload.trim().length === 0) {
        console.error("Error: Empty or invalid input payload received.");
        return; // Exit early if no meaningful data.
    }

    // Split the raw input string into an array of individual data segments.
    // Multiple spaces will be treated as a single delimiter by regex.
    const dataSegments = incomingTextPayload.split(/\s+/);

    // Validate if enough numerical segments are present for evaluation.
    if (dataSegments.length < 2) {
        console.error("Error: Insufficient data segments for evaluation. Expected 2, got " + dataSegments.length);
        console.log("NO"); // Default to NO if input is malformed.
        return;
    }

    // Attempt to parse the first segment as the number of units.
    // Use Number() for explicit type conversion, which handles various numeric formats.
    const budgetUnitCount = Number(dataSegments[0]);

    // Attempt to parse the second segment as the target investment amount.
    const requiredInvestmentAmount = Number(dataSegments[1]);

    // Validate if parsed values are actual numbers.
    if (isNaN(budgetUnitCount) || isNaN(requiredInvestmentAmount)) {
        console.error("Error: Non-numeric values encountered in input. Please provide valid numbers.");
        console.log("NO"); // Default to NO if parsed values are not numbers.
        return;
    }

    // Calculate the total available budget based on units and unit cost.
    // This is an intermediate step to make the calculation explicit.
    let totalAvailableBudget = budgetUnitCount * UNIT_COST_PER_ITEM;

    // Compare the total available budget against the required investment amount.
    // Store the comparison result in a boolean variable for clarity.
    let meetsThreshold = (totalAvailableBudget >= requiredInvestmentAmount);

    // Determine the final output message based on the comparison result.
    // Using a ternary operator for a concise conditional output.
    const evaluationResult = meetsThreshold ? "YES" : "NO";

    // Output the final decision to the console.
    console.log(evaluationResult);

}

// The entry point for execution. Reads input from standard input stream.
// It's crucial to specify UTF-8 encoding for proper string handling.
// The readFileSync call is synchronous and blocks until input is available.
evaluateFinancialThreshold(require("fs").readFileSync("/dev/stdin", "utf8"));