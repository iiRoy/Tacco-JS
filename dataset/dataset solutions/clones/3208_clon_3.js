function calculateFinalOutcome(rawInputString) {
    // This function processes a raw input string to compute a specific numerical outcome.
    // The input is expected to be a space-separated string of three integers.

    // 1. Parse the input: Split the raw string into an array of string segments.
    let inputSegments = rawInputString.split(' ');

    // 2. Input Validation (Guard Clause): Ensure minimum required segments are present.
    // If the input doesn't contain at least three values, log an error and exit.
    if (inputSegments.length < 3) {
        console.error("Error: Insufficient input parameters. Three numeric values are expected.");
        return; // Terminate execution for invalid input.
    }

    // 3. Convert string segments to integer types using Number.parseInt.
    // The base 10 (radix) is explicitly provided for clarity and safety.
    const goalValue = Number.parseInt(inputSegments[0], 10);      // Represents original 'K'
    const initialAmount = Number.parseInt(inputSegments[1], 10);  // Represents original 'A'
    const secondaryAmount = Number.parseInt(inputSegments[2], 10); // Represents original 'B'

    // 4. Calculate core differences and steps.
    // 'valueDifference' is the constant increment applied in certain calculations.
    const valueDifference = secondaryAmount - initialAmount; // Equivalent to original 'D'

    // 'requiredSteps' denotes the number of steps or iterations from initial to goal.
    const requiredSteps = goalValue - initialAmount;         // Equivalent to original 'E'

    let finalComputation; // Declare the variable to store the final result.

    // 5. Determine the final computation based on a series of conditional checks.
    // This section rewrites the original compact ternary logic into an expanded if-else structure.

    // Check for a primary special condition:
    // If 'requiredSteps' is less than 2, OR 'valueDifference' is less than 3.
    const isPrimarySpecialConditionMet = (requiredSteps < 2 || valueDifference < 3);

    if (isPrimarySpecialConditionMet) {
        // If the special condition is met, the outcome is a simple addition.
        finalComputation = goalValue + 1;
    } else {
        // If the primary special condition is NOT met, proceed to check the parity of 'requiredSteps'.

        const areRequiredStepsEven = (requiredSteps % 2 === 0);

        if (areRequiredStepsEven) {
            // Case 1: If 'requiredSteps' is an even number.
            // Perform calculation: initialAmount + (requiredSteps * valueDifference / 2) + 1
            let productOfStepsAndDiff = requiredSteps * valueDifference;
            let halfOfProduct = productOfStepsAndDiff / 2;
            finalComputation = initialAmount + halfOfProduct + 1;
        } else {
            // Case 2: If 'requiredSteps' is an odd number.
            // Perform calculation: initialAmount + ((requiredSteps + 1) * valueDifference / 2)
            let adjustedStepsForOddCount = requiredSteps + 1;
            let productWithAdjustedSteps = adjustedStepsForOddCount * valueDifference;
            let halfOfAdjustedProduct = productWithAdjustedSteps / 2;
            finalComputation = initialAmount + halfOfAdjustedProduct;
        }
    }

    // 6. Output the calculated final result to the standard console.
    console.log(finalComputation);
}

// --- Main execution block for reading input and invoking the processing function ---

// Utilize Node.js 'fs' module to synchronously read content from standard input.
// This is a common pattern in competitive programming environments.
// The input is expected to be a single line of text.
const inputDataString = require("fs").readFileSync("/dev/stdin", "utf8");

// Call our main processing function with the obtained input string.
calculateFinalOutcome(inputDataString);