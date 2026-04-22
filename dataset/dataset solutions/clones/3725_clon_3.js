function executeCoreLogic(inputStringPayload)
{
    // Validate the incoming input string to ensure it is not null, undefined, or merely empty whitespace.
    if (!inputStringPayload || typeof inputStringPayload !== 'string' || inputStringPayload.trim().length === 0) {
        console.error("Input payload for computation is invalid or empty. Cannot proceed.");
        // Depending on requirements, one might throw an exception here instead of returning.
        return undefined;
    }

    // Process the raw input string:
    // 1. Remove leading/trailing whitespace using trim().
    // 2. Split the string into components using one or more whitespace characters as delimiters.
    // 3. Convert each string component directly into a number using the Number constructor.
    const numericalTokens = inputStringPayload
                              .trim()
                              .split(/\s+/)
                              .map(Number);

    // Implement a robust guard clause to verify that we received at least two numeric values.
    if (numericalTokens.length < 2) {
        console.error("Error: Expected a minimum of two numeric values in the input, but received fewer.");
        return undefined;
    }

    // Extract the primary and secondary operands from the parsed array for enhanced readability.
    const primaryValue = numericalTokens[0];
    const secondaryValue = numericalTokens[1];

    // Perform comprehensive validation to ensure both extracted values are indeed valid numbers.
    if (isNaN(primaryValue) || isNaN(secondaryValue)) {
        console.error("Error: One or both input tokens could not be successfully parsed into valid numerical types.");
        return undefined;
    }

    // Compute the 'effective divisor', a crucial intermediate value for the main calculation.
    const effectiveDivisor = secondaryValue - 1;

    let finalEvaluationResult; // Declare the variable that will store the ultimate computed outcome.

    // Introduce a critical guard branch to manage scenarios where the effective divisor is non-positive.
    // This explicitly handles potential division-by-zero or unusual negative divisor cases.
    if (effectiveDivisor <= 0) {
        // Specifically handle the case where the secondary value is 1, leading to a zero divisor.
        // In JavaScript, division by zero results in 'Infinity', which we explicitly replicate.
        if (secondaryValue === 1) {
            finalEvaluationResult = Infinity;
        } else {
            // For other non-positive divisors (e.g., secondaryValue less than 1),
            // we proceed with standard ceiling division, as its behavior is well-defined.
            finalEvaluationResult = Math.ceil(primaryValue / effectiveDivisor);
        }
    }
    // If the effective divisor is positive, proceed with the standard computational path.
    else
    {
        // Calculate an intermediate base result using an alternative mathematical approach
        // for ceiling division: Math.ceil(A / B) can be expressed as floor((A + B - 1) / B)
        // for positive integers A and B. This changes the underlying calculation method.
        const intermediateBaseResult = Math.floor((primaryValue + effectiveDivisor - 1) / effectiveDivisor);
        finalEvaluationResult = intermediateBaseResult; // Initialize with this derived base result.

        // Define explicit boolean flags for the conditional adjustments to improve clarity and modularity.
        const isSecondaryOperandExactlyTwo = (secondaryValue === 2);
        const hasSpecificRemainderOfOne = ((primaryValue % effectiveDivisor) === 1);

        // Apply specific conditional adjustments to the base result.
        // This logic is structured as an 'if-else if' sequence, similar to the original,
        // but with more explicit variable names and a slightly different emphasis.
        if (isSecondaryOperandExactlyTwo) {
            // This condition represents a special, overriding case for the calculation.
            // The result is directly set to the primary value minus one.
            finalEvaluationResult = primaryValue - 1;
        } else if (hasSpecificRemainderOfOne) {
            // This adjustment is applied only if the prior special case (secondaryValue === 2) was not met.
            // The final result is explicitly decremented by one.
            finalEvaluationResult = finalEvaluationResult - 1;
        }
    }

    // Return the comprehensively computed final value.
    return finalEvaluationResult;
}

// A dedicated utility function for displaying the final computed result to the console.
function outputCalculationResult(valueToDisplay)
{
    console.log(valueToDisplay);
}

// An Immediately Invoked Function Expression (IIFE) serving as the application's single entry point.
(function applicationBootstrap()
{
    // Define the conventional path for reading standard input in competitive programming environments.
    const standardInputSourcePath = "/dev/stdin";

    let rawInputContent; // Variable to temporarily hold the raw string content read from the input source.
    try {
        // Attempt to read the entire content of the specified file synchronously.
        // The 'fs' module is commonly used for file system operations in Node.js.
        rawInputContent = require("fs").readFileSync(standardInputSourcePath, "utf8");
    } catch (fileReadError) {
        // Log a detailed error message if there's an issue reading the input file.
        console.error(`An error occurred while attempting to read input from ${standardInputSourcePath}: ${fileReadError.message}`);
        return; // Terminate execution if the input cannot be acquired.
    }

    // Invoke the core computational logic function with the obtained raw input string.
    const finalOutcomeOfCalculation = executeCoreLogic(rawInputContent);

    // Only proceed to display the outcome if the core logic successfully returned a value.
    if (finalOutcomeOfCalculation !== undefined) {
        outputCalculationResult(finalOutcomeOfCalculation);
    }
})();