// This function is designed to process a given string of numerical data,
// performing a series of calculations based on three primary values extracted from it.
// The objective is to compute a specific result under various conditions.
function processNumericalSequence(inputDataString) {
    // Step 1: Parse the raw input string.
    // The string is expected to contain space-separated numerical components.
    const rawParts = inputDataString.split(' ');

    // Step 2: Convert string parts into actual numbers.
    // Using `map` for a clean transformation, ensuring each element is a number.
    const numericalComponents = rawParts.map(part => Number(part));

    // Step 3: Implement an input validation guard clause.
    // We require at least three valid numbers for our calculations.
    // If the input is malformed or insufficient, an error is logged, and the function exits.
    if (numericalComponents.length < 3 || numericalComponents.some(val => isNaN(val))) {
        console.error("Data processing halted: Invalid or insufficient numerical input provided. Expected 'NUM1 NUM2 NUM3'.");
        return; // Abort execution
    }

    // Step 4: Destructure the numerical components into clearly named constants.
    // This improves readability and makes the role of each number explicit.
    const [valueAlpha, valueBeta, valueGamma] = numericalComponents;

    // Declare a variable to store the final outcome of the computation.
    // It's initialized to `undefined` and will be assigned later based on conditional logic.
    let calculatedFinalResult;

    // Step 5: Perform the initial conditional check.
    // Compare 'valueAlpha' with the product of 'valueBeta' and 'valueGamma'.
    const productOfBetaGamma = valueBeta * valueGamma;
    if (valueAlpha > productOfBetaGamma) {
        // If 'valueAlpha' is strictly greater, the result is a simple difference.
        calculatedFinalResult = valueAlpha - productOfBetaGamma;
    } else {
        // Step 6: If the first condition is not met, proceed with more intricate logic.
        // Calculate a rounded quotient, which is a frequently used intermediate value.
        const roundedQuotient = Math.round(valueAlpha / valueGamma);

        // Step 7: Determine the parity (even or odd) for two key values.
        // This is crucial for the subsequent branching logic.
        const parityOfQuotient = roundedQuotient % 2;
        const parityOfBeta = valueBeta % 2;

        // Step 8: Check if the parities of the rounded quotient and 'valueBeta' are identical.
        if (parityOfQuotient === parityOfBeta) {
            // If parities match, calculate the absolute difference from a specific term.
            const intermediateCalculationTerm = valueAlpha - (valueBeta * roundedQuotient);
            calculatedFinalResult = Math.abs(intermediateCalculationTerm);
        } else {
            // Step 9: If parities differ, another layer of conditional logic is needed.
            // Calculate a temporary difference using the current rounded quotient.
            const temporaryDifference = valueAlpha - (valueBeta * roundedQuotient);

            // Step 10: Adjust the rounded quotient based on the sign of the temporary difference.
            if (temporaryDifference < 0) {
                // If the temporary difference is negative, increment the rounded quotient.
                const modifiedProduct = valueGamma * (roundedQuotient + 1);
                calculatedFinalResult = Math.abs(valueAlpha - modifiedProduct);
            } else {
                // If the temporary difference is non-negative, decrement the rounded quotient.
                const alternateModifiedProduct = valueGamma * (roundedQuotient - 1);
                calculatedFinalResult = Math.abs(valueAlpha - alternateModifiedProduct);
            }
        }
    }

    // Step 11: Output the final computed result.
    // This ensures a single point of output for the main logic flow.
    // A check is added to ensure a result was indeed computed before logging.
    if (calculatedFinalResult !== undefined) {
        console.log(calculatedFinalResult);
    } else {
        // This path should ideally not be reached with valid input,
        // but serves as a robustness measure for unexpected scenarios.
        console.warn("An unexpected condition occurred; no specific result was determined.");
    }
}

// Example usage: Invoke the function with a sample input string.
// This string represents three numerical values: 10, 4, and 3.
processNumericalSequence(`10 4 3`);

// The following commented line illustrates how the function might be called
// in an environment where input is read from standard input (e.g., competitive programming platforms).
// processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));