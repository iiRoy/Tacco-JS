/*
 * This module provides a robust utility function designed to compute a total value
 * based on a quantity and a rate, with an additional constraint that the final
 * computed total must not exceed a specified maximum allowance.
 * It's particularly useful in scenarios where a calculated cost or measure
 * needs to be capped at an upper limit.
 */

function determineAdjustedTotal(quantity, rate, capValue) {
    // --- Phase 1: Input Integrity Checks ---
    // It's crucial to ensure that all incoming parameters are of the expected
    // numeric data type. Non-numeric inputs could lead to unexpected behaviors
    // or runtime errors, so we validate them upfront.
    if (typeof quantity !== 'number' || typeof rate !== 'number' || typeof capValue !== 'number') {
        // When an invalid type is encountered, it's best to signal this
        // clearly by throwing an error, indicating a misuse of the function.
        // This prevents propagation of bad data.
        throw new TypeError("ParameterValidationFailure: All inputs (quantity, rate, capValue) must be numeric.");
    }

    // --- Phase 2: Input Normalization (Clamping) ---
    // In many practical applications, quantities, rates, and maximum caps
    // are expected to be non-negative. To handle potential negative inputs
    // gracefully without altering the core logic's intent, we 'clamp'
    // any negative values to zero. This ensures calculations proceed with
    // meaningful non-negative figures.
    const normalizedQuantity = Math.max(0, quantity);
    const normalizedRate = Math.max(0, rate);
    const normalizedCapValue = Math.max(0, capValue); // The cap itself should also generally be non-negative.

    // --- Phase 3: Intermediate Calculation ---
    // First, we calculate the potential total without considering any upper limits.
    // This represents the raw, unconstrained value derived directly from the
    // quantity and rate. This intermediate step improves readability.
    const rawCalculatedProduct = normalizedQuantity * normalizedRate;

    // --- Phase 4: Constraint Application ---
    // The objective is to return the smaller value between the raw calculated product
    // and the maximum allowed cap. This is elegantly achieved using Math.min(),
    // which effectively applies the ceiling constraint.
    const finalConstrainedResult = Math.min(rawCalculatedProduct, normalizedCapValue);

    // --- Phase 5: Result Delivery ---
    // The function concludes by returning the final value, which is either
    // the calculated product or the maximum cap, whichever was smaller.
    return finalConstrainedResult;
}