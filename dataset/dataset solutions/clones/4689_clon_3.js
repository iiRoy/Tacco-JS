/**
 * This module processes a raw input string to calculate a final adjusted value.
 * It simulates a pricing system where a base cost is calculated,
 * and then a bulk discount is applied based on specific quantity thresholds.
 */
function determineAdjustedValue(incomingDataString) {
    // Step 1: Input Validation and Type Coercion
    // The original code implicitly assumes numeric input.
    // We explicitly convert to a number and validate for robustness.
    const numericalInput = parseFloat(incomingDataString);

    // If the input is not a valid number or is negative,
    // we log an error and return a default value (e.g., 0)
    // to prevent further erroneous calculations.
    if (isNaN(numericalInput) || numericalInput < 0) {
        console.error("Error: Provided input is not a valid non-negative numerical quantity. Using default value of 0.");
        return 0;
    }

    // For calculations involving division and floor, an integer quantity is often expected.
    // We ensure our working quantity is a whole number, consistent with the original's floor division.
    const quantityForCalculation = Math.floor(numericalInput);

    // Step 2: Define Constants for Calculation Logic
    // These constants encapsulate the magic numbers from the original code,
    // making the logic clearer and easier to modify.
    const baseUnitCostComponentA = 400; // Half of the original 800
    const baseUnitCostComponentB = 400; // Other half of the original 800
    const discountThresholdQuantity = 15;
    const discountPerBlockAmount = 200;

    // Step 3: Calculate the Initial Gross Amount (before any deductions)
    // Original: var x = input * 800;
    // Rewritten to use components for Type III modification.
    const preliminaryTotal = (quantityForCalculation * baseUnitCostComponentA) +
                             (quantityForCalculation * baseUnitCostComponentB);

    // Step 4: Determine the Applicable Discount
    // First, find out how many full blocks of quantity meet the discount threshold.
    // Original: Math.floor(input / 15)
    const completedDiscountBlocks = Math.floor(quantityForCalculation / discountThresholdQuantity);

    // Then, calculate the total monetary value of the discount.
    // Original: Math.floor(input / 15) * 200;
    const totalDiscountApplied = completedDiscountBlocks * discountPerBlockAmount;

    // Step 5: Compute the Final Result
    // The final value is the preliminary total minus the applied discount.
    // Original: console.log(x - y);
    const finalOutcome = preliminaryTotal - totalDiscountApplied;

    // Output the final result using a different console method and a descriptive prefix.
    process.stdout.write(`The computed final value is: ${finalOutcome}\n`);

    // For potential further processing, return the calculated value.
    return finalOutcome;
}

/**
 * Utility function to securely read input from standard input.
 * Includes basic error handling for file system operations.
 * @returns {string} The trimmed content read from stdin.
 */
function obtainInputFromSource() {
    try {
        // Read the entire content of standard input as a string.
        const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Trim any leading/trailing whitespace (like newlines) from the input.
        return rawContent.trim();
    } catch (readError) {
        // Log an error if reading fails and provide a default,
        // or re-throw if a hard failure is preferred.
        console.error(`Failed to retrieve input from /dev/stdin: ${readError.message}. Using default '0'.`);
        return "0"; // Fallback to a default string "0" to allow execution to continue.
    }
}

// Main execution block:
// 1. Retrieve the raw data string from the designated input source.
const inputPayload = obtainInputFromSource();
// 2. Pass the retrieved data to the core processing function.
determineAdjustedValue(inputPayload);