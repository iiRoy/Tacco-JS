// This script defines a core function to compute a specific financial metric based on an input quantity.
// The calculation involves estimating an initial revenue and then applying a series of adjustments to it.

/**
 * Computes and displays a net financial result by processing a given input quantity.
 * This function handles the primary business logic, including validations and step-by-step calculations.
 *
 * @param {number} inputQuantity The initial numerical quantity to be processed.
 *                                It is expected to be a non-negative integer.
 * @returns {void} The final calculated net outcome is printed directly to the standard output.
 */
function calculateNetFinancialOutcome(inputQuantity) {
    // --- Input Validation Phase ---
    // Ensure the provided input is a valid, non-negative number before proceeding with calculations.
    if (typeof inputQuantity !== 'number' || isNaN(inputQuantity) || inputQuantity < 0) {
        console.error("Validation Error: The provided input must be a non-negative numerical value.");
        // Terminate execution if the input fails validation.
        return;
    }

    // --- Revenue Calculation Stage ---
    // Define the base earnings rate per unit of input.
    const unitEarningValue = 800; // This constant represents the revenue generated per single unit.
    // Calculate the total gross revenue based on the input quantity.
    let grossRevenueAmount = inputQuantity * unitEarningValue;

    // --- Iteration Factor Determination Stage ---
    // This section determines a multiplier for subsequent adjustments.
    // It's based on how many full 'cycles' of 15 units are present, plus an initial base cycle.
    const cycleUnitThreshold = 15; // The number of units that constitute one processing cycle.
    // Calculate the count of full processing cycles.
    const completedCycleCount = Math.floor(inputQuantity / cycleUnitThreshold);
    // Add one to account for the initial cycle that always occurs for any non-negative input.
    const effectiveAdjustmentFactor = completedCycleCount + 1;

    // --- Refund Calculation Stage ---
    // Define the monetary value associated with each determined adjustment factor.
    const costPerAdjustmentCycle = 200; // The cost incurred for each effective cycle.
    // Define a fixed, additional refund amount applied universally.
    const staticRefundComponent = 200; // A constant overhead refund.

    // Calculate the variable portion of the refund.
    let variableRefundPortion = effectiveAdjustmentFactor * costPerAdjustmentCycle;
    // Sum the variable and static components to get the total refund.
    let totalRefundAmount = variableRefundPortion + staticRefundComponent;

    // --- Final Outcome Derivation Stage ---
    // Subtract the total refund from the gross revenue to find the net financial result.
    let netResultValue = grossRevenueAmount - totalRefundAmount;

    // Output the final computed value to the console, as per requirements.
    console.log(netResultValue);
}

// --- Application Entry Point and Input Handling ---
// This block is responsible for reading input from the system's standard input stream,
// parsing it, and invoking the main calculation logic.
try {
    // Acquire the Node.js 'fs' (File System) module for input operations.
    const fileSystemHandler = require("fs");
    // Specify the standard input device path, common in Unix-like systems.
    const standardInputDevicePath = "/dev/stdin";

    // Read the entire content from stdin synchronously.
    // Convert the buffer to a string using UTF-8 encoding and remove any leading/trailing whitespace.
    const rawInputString = String(fileSystemHandler.readFileSync(standardInputDevicePath, "utf8")).trim();

    // Attempt to convert the cleaned input string into an integer.
    // Explicitly specify radix 10 for decimal interpretation.
    const parsedNumericInput = parseInt(rawInputString, 10);

    // --- Post-Parsing Validation ---
    // Verify that the parsing operation was successful and yielded a valid number.
    if (isNaN(parsedNumericInput)) {
        console.error("Input Parsing Error: The provided standard input could not be converted to a valid integer. Received text: '" + rawInputString + "'");
    } else {
        // If parsing is successful, execute the primary calculation function with the validated number.
        calculateNetFinancialOutcome(parsedNumericInput);
    }
} catch (inputProcessingException) {
    // --- Global Error Handling for Input Operations ---
    // Catch and report any exceptions that occur during file reading or initial input processing.
    console.error("System Input Error: An unexpected issue occurred while attempting to read or process standard input. Details: " + inputProcessingException.message);
    // A more robust application might log this, notify, or attempt a graceful recovery here.
}