/**
 * This module provides a utility function to compute an adjusted numerical value
 * based on a specific pricing or discount structure.
 * It's designed to process a single integer input, applying a tiered discount.
 */

/**
 * Processes a raw string input to calculate a final economic value.
 * The calculation involves a base unit cost and a periodic discount.
 *
 * @param {string} incomingDataString - The raw string received, expected to contain
 *                                      a single non-negative integer representing a quantity.
 * @returns {void} This function prints the final calculated value to the console.
 */
function calculateAdjustedValue(incomingDataString) {
    // Define key constants for the calculation logic.
    // These constants make the business rules explicit and easily modifiable.
    const STANDARD_UNIT_RATE = 800;          // The base cost per single unit.
    const BULK_DISCOUNT_PER_SEGMENT = 200;   // The discount applied for each full segment.
    const DISCOUNT_SEGMENT_THRESHOLD = 15;   // The number of units required to form one discount segment.

    // Step 1: Data preparation and validation.
    // Trim whitespace from the raw string and attempt to convert it to an integer.
    const cleanedInput = incomingDataString.trim();
    let processedQuantity = Number.parseInt(cleanedInput, 10); // Base 10 for explicit parsing.

    // Implement a guard clause to handle invalid or negative input quantities.
    // If input is not a number or is negative, default to zero and log an error.
    if (isNaN(processedQuantity) || processedQuantity < 0) {
        console.error("Warning: Non-numeric or negative input detected. Proceeding with a quantity of zero.");
        processedQuantity = 0; // Neutralize invalid input to avoid calculation errors.
    }

    // Step 2: Calculate the gross amount before any discounts.
    // This is the straightforward cost if no special conditions apply.
    const grossAmountPriorToDiscounts = STANDARD_UNIT_RATE * processedQuantity;

    // Step 3: Determine the number of discount segments applicable.
    // Using Math.floor ensures that only full segments contribute to the discount.
    const numberOfQualifiedSegments = Math.floor(processedQuantity / DISCOUNT_SEGMENT_THRESHOLD);

    // Step 4: Calculate the total discount based on qualified segments.
    // This is the sum of all discounts accumulated from the full segments.
    const totalDiscountApplied = BULK_DISCOUNT_PER_SEGMENT * numberOfQualifiedSegments;

    // Step 5: Compute the net final value.
    // Subtract the total discount from the gross amount to get the final cost.
    const finalNetResult = grossAmountPriorToDiscounts - totalDiscountApplied;

    // Step 6: Output the computed result.
    // The final value is displayed on the standard output stream.
    console.log(finalNetResult);
}

// Main execution block:
// Reads the entire content of the standard input stream as a UTF-8 string,
// then passes this string to our primary processing function.
calculateAdjustedValue(require("fs").readFileSync("/dev/stdin", "utf8"));