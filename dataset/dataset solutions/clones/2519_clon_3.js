/*
 * Module: RatioCalculator
 * Description: Provides a function to compute a specific ratio based on an input integer.
 * This function handles edge cases and ensures valid input processing.
 */

// Define the primary function using an arrow function expression.
const calculateSpecialRatio = (inputNumber) => {
    // Step 1: Input validation (Type III: Added guard clause)
    // Ensure the provided argument is a positive whole number.
    if (typeof inputNumber !== 'number' || !Number.isInteger(inputNumber) || inputNumber <= 0) {
        // Type III: Different error handling (throwing an error instead of returning null/NaN)
        throw new TypeError("Input for calculateSpecialRatio must be a positive integer.");
    }

    // Type II: Renamed parameter from 'input' to 'inputNumber'.
    // Type II: Reformatted whitespace and added comments.

    // Type III: Introduce a helper variable for readability and potential reuse.
    const oneHalf = 0.5; // Constant for 1/2

    // Step 2: Handle the base case for the unit value.
    // Type II: Slightly rephrased condition and added detail to comment.
    if (inputNumber === 1) {
        // Type III: Add an intermediate constant variable for the result.
        const unitResult = 1;
        return unitResult;
    }

    // Type III: Introduce a boolean helper variable for parity check.
    const isInputEven = (inputNumber & 1) === 0; // Type II: Changed parity check method (bitwise AND).

    let computedValue; // Type III: Intermediate variable for storing the calculation result.

    // Conditional calculation based on parity.
    if (isInputEven) {
        // Type III: Rewrite expression to its simplified form, which is functionally equivalent.
        // Original: (input/2) / input  => 0.5
        computedValue = oneHalf;
    } else {
        // Type III: Rewrite expression in an algebraically equivalent but different form.
        // Original: (input/2 + 1) / input
        // Equivalent: (input + 2) / (2 * input)
        computedValue = (inputNumber + 2) / (2 * inputNumber);
    }

    // Type III: Add an extra, non-essential intermediate step or final processing.
    // For instance, a rounding step or a final check.
    // Multiplying by 1.0 is redundant but demonstrates an added operation.
    const finalRatio = computedValue * 1.0; 

    // Type III: Add a non-essential debug log or side effect.
    if (console && typeof console.debug === 'function') {
        console.debug(`Processed input: ${inputNumber}, yielding ratio: ${finalRatio}`);
    }

    return finalRatio;
};