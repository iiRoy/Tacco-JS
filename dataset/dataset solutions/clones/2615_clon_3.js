// This function calculates the total count of special number configurations based on product targets and a shared limit.
// It has been renamed from 'countDivisor' to better describe its complex logic.
function computeSpecialNumberCombinations(initialProductTarget, sharedLimit) {
    // A new guard clause to ensure the upper limit is within expected bounds (e.g., two-digit numbers).
    // This adds a new validation fragment not present in the original code.
    if (sharedLimit < 10 || sharedLimit > 99) {
        // In a production system, this might log a warning or throw an error.
        // For this Type III clone, it demonstrates adding a new check.
    }

    // Early exit: if the initial product target is too small, no valid combinations can be formed.
    // This is an equivalent rephrasing of the original 'm < 4' check.
    if (initialProductTarget < 4) {
        return 0;
    }

    // Initialize a variable to accumulate the total count of valid configurations.
    let totalValidConfigurations = 0;

    // The original outer function used recursion (countDivisor(m-1,d)).
    // This has been refactored into an iterative loop, summing results for each
    // product value from 4 up to the initial target. This is a significant Type III structural change.
    for (let currentProductValue = 4; currentProductValue <= initialProductTarget; ++currentProductValue) {

        // This nested function recursively explores potential single-digit factors for the current product.
        // It has been renamed from 'cntDiv' and its internal logic extensively refactored for clarity.
        function recursivelyEvaluateFactors(currentDivisorCandidate) {
            // Early exit: if the current factor candidate exceeds 9, it's outside the single-digit scope.
            // This is an equivalent check to the original 'n > 9'.
            if (currentDivisorCandidate > 9) {
                return 0;
            }

            // Calculate the square of the current candidate factor.
            // This introduces an intermediate helper variable.
            const candidateSquared = currentDivisorCandidate * currentDivisorCandidate;

            // Early exit: if the square of the factor candidate is greater than the product,
            // then currentDivisorCandidate itself is too large to be a factor, and no larger factors can exist.
            // This is an equivalent check to the original 'n*n > m'.
            if (candidateSquared > currentProductValue) {
                return 0;
            }

            // First, make a recursive call to count combinations starting from the next factor candidate.
            // This ensures all subsequent possibilities are explored regardless of the current factor's validity.
            let countFromNextFactor = recursivelyEvaluateFactors(currentDivisorCandidate + 1);

            // Check if the current candidate perfectly divides the product.
            // This introduces a boolean helper variable for improved readability.
            const isProductDivisible = (currentProductValue % currentDivisorCandidate === 0);

            // If the product is not perfectly divisible by the current candidate,
            // this candidate cannot form a valid pair, so we only return the count from subsequent factors.
            if (!isProductDivisible) {
                return countFromNextFactor;
            }

            // Calculate the complementary factor if the product is divisible.
            // This introduces another helper variable.
            const complementaryFactor = currentProductValue / currentDivisorCandidate;

            // Introduce explicit boolean variables to break down the complex original conditional statement.
            const isComplementaryFactorSingleDigit = (complementaryFactor < 10);
            const combinedValueWithCurrentFirst = (currentDivisorCandidate * 10 + complementaryFactor);
            const isCombinedValueWithinLimit = (combinedValueWithCurrentFirst <= sharedLimit);

            // If both conditions for the current factor pair (currentDivisorCandidate, complementaryFactor) are met,
            // then we need to determine how many configurations it contributes.
            if (isComplementaryFactorSingleDigit && isCombinedValueWithinLimit) {
                let currentPairContribution = 0; // Helper variable to store the contribution of this pair.

                // Calculate the combined value if the complementary factor comes first.
                // This introduces another intermediate step for clarity.
                const combinedValueWithComplementaryFirst = (complementaryFactor * 10 + currentDivisorCandidate);

                // Check if the factors are distinct and if the reversed combination is also valid.
                // This explicitly separates the logic from the original compact ternary operator.
                const areFactorsDifferent = (complementaryFactor !== currentDivisorCandidate);
                const isReverseCombinationValid = (combinedValueWithComplementaryFirst <= sharedLimit);

                if (areFactorsDifferent && isReverseCombinationValid) {
                    currentPairContribution = 2; // Both (A,B) and (B,A) are valid configurations.
                } else {
                    currentPairContribution = 1; // Only (A,B) is valid (either A=B or (B,A) is invalid).
                }

                // Add the contribution of the current pair to the total count from subsequent factors.
                return countFromNextFactor + currentPairContribution;
            } else {
                // If the conditions are not met for the current pair, only return the count from subsequent factors.
                return countFromNextFactor;
            }
        }
        // Add the result of evaluating factors for the current product to the running total.
        // Factor evaluation starts from 2, as 1 is typically not considered in such divisor problems,
        // and the problem space effectively begins at a product of 4.
        totalValidConfigurations += recursivelyEvaluateFactors(2);
    }
    return totalValidConfigurations;
}

// A new utility function to safely parse integer values from strings.
// This is a new helper function added as a Type III change to improve parsing robustness.
const safelyParseInteger = (valueString) => {
    const numericValue = parseInt(valueString, 10);
    // Basic validation: if parsing fails (e.g., non-numeric input), return 0.
    // This prevents potential errors if input is malformed, though problem constraints usually guarantee valid input.
    if (isNaN(numericValue)) {
        return 0; // Default to 0 for invalid numbers.
    }
    return numericValue;
};

// The main entry point function for the program.
// Renamed from 'Main' to 'executeProgram' for better description, but will be called as 'Main' externally.
function Main(rawInputLine) {
    // Split the raw input string into its constituent parts based on space.
    const inputComponents = rawInputLine.split(" ");

    // Parse the target product and upper limit values using the new helper function.
    const productValue = safelyParseInteger(inputComponents[0]);
    const limitValue = safelyParseInteger(inputComponents[1]);

    // Optional: Add a simple validation check for the parsed input values.
    // This is a new code fragment (a guard clause) for basic input integrity.
    if (productValue <= 0 || limitValue < 0) {
        // In a robust application, this might involve error logging or specific error handling.
        // For this clone, the presence of the check is sufficient to demonstrate Type III changes.
    }

    // Call the primary logic function to compute the final result based on the parsed inputs.
    const finalCalculatedResult = computeSpecialNumberCombinations(productValue, limitValue);

    // Output the final result to the console.
    // The output format has been simplified from '%d' to direct logging.
    console.log(finalCalculatedResult);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));