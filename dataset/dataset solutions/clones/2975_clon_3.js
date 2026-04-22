// A custom utility function designed for outputting information to the standard console.
// This function ensures that all messages are consistently converted to strings
// and terminated with a newline character, enhancing readability of program output.
const logComputationResult = (messageContent) => {
    // Explicitly casting the message to a String type before writing.
    // This handles various data types gracefully, preventing potential errors.
    process.stdout.write(String(messageContent) + '\n');
};

// This is the primary function responsible for executing the core logic of the application.
// It takes raw input as a string, processes it, performs calculations, and then
// outputs the final computed result using the custom logging utility.
function PerformTargetSumAnalysis(rawInputStringData) {

    // Phase 1: Input Normalization and Parsing
    // First, remove any leading or trailing whitespace characters from the entire input string.
    const trimmedInputPayload = rawInputStringData.trim();

    // Implement a preliminary validation step: If the input becomes empty after trimming,
    // it indicates a lack of meaningful data. Log an error and terminate execution.
    if (!trimmedInputPayload) {
        logComputationResult("Error: The provided input data string is unexpectedly empty.");
        return; // Halt further processing as input is invalid.
    }

    // Split the cleaned input string into individual tokens based on one or more whitespace characters.
    // Then, convert each token into an integer using parseInt with radix 10 for safety.
    const parsedNumericValues = trimmedInputPayload.split(/\s+/).map(currentSegment => {
        const numericalRepresentation = parseInt(currentSegment, 10);

        // A robust check to ensure that each segment successfully converts to a valid number.
        // If conversion fails (results in NaN), log a warning and substitute with zero.
        // Depending on requirements, this could be an error that halts execution.
        if (isNaN(numericalRepresentation)) {
            logComputationResult(`Warning: Encountered a non-numeric segment '${currentSegment}'. Defaulting to zero.`);
            return 0; // Provide a default value for invalid inputs.
        }
        return numericalRepresentation;
    });

    // Enforce the expected input structure: exactly four numeric parameters are required.
    // If this condition is not met, log an error and exit.
    if (parsedNumericValues.length !== 4) {
        logComputationResult("Error: Expected precisely four numerical parameters, but received " + parsedNumericValues.length + ".");
        return;
    }

    // Destructure the array of parsed numbers into more semantically meaningful variables.
    // These represent the coefficients (R, G, B) and the target sum (N).
    const [coefficientRed, coefficientGreen, coefficientBlue, targetSumValue] = parsedNumericValues;

    // Critical validation: Ensure all coefficients are positive and the target sum is non-negative.
    // These are fundamental constraints for the problem's mathematical context.
    if (coefficientRed <= 0 || coefficientGreen <= 0 || coefficientBlue <= 0 || targetSumValue < 0) {
        logComputationResult("Error: All color coefficients must be positive integers, and the target sum must be non-negative.");
        return;
    }

    // Phase 2: Coefficient Prioritization
    // Create an array containing the three coefficients.
    const coefficientSet = [coefficientRed, coefficientGreen, coefficientBlue];

    // Sort the coefficients in descending order. This strategy simplifies the subsequent
    // combinatorial search by always starting with the largest possible step.
    coefficientSet.sort((valueA, valueB) => valueB - valueA);

    // Assign the sorted coefficients to descriptive variables.
    // 'Primary' is the largest, 'Secondary' is the middle, 'Tertiary' is the smallest.
    const primaryCoefficient = coefficientSet[0];
    const secondaryCoefficient = coefficientSet[1];
    const tertiaryCoefficient = coefficientSet[2];

    // Initialize a counter to track the total number of valid combinations found.
    let totalValidCombinations = 0;

    // Phase 3: Iterative Search for Combinations
    // Determine the maximum possible number of times the primary coefficient can be used
    // without exceeding the target sum. This sets the upper bound for the outer loop.
    const maxPrimaryIterationsPossible = Math.floor(targetSumValue / primaryCoefficient);

    // Outer loop: Iterates through all possible counts for the primary coefficient (i).
    // The loop variable `firstFactorCount` represents 'i' from the original problem.
    for (let firstFactorCount = 0; firstFactorCount <= maxPrimaryIterationsPossible; ++firstFactorCount) {
        const sumFromPrimaryFactor = firstFactorCount * primaryCoefficient;
        const remainingSumForOtherFactors = targetSumValue - sumFromPrimaryFactor;

        // An early exit condition: if the remaining sum becomes negative,
        // it means this path (and any further increments of firstFactorCount)
        // cannot lead to a valid combination. This is a redundant check due to
        // `maxPrimaryIterationsPossible` but serves as an explicit guard.
        if (remainingSumForOtherFactors < 0) {
            continue; // Skip to the next iteration of the outer loop.
        }

        // Determine the maximum possible number of times the secondary coefficient can be used
        // given the `remainingSumForOtherFactors`. This sets the upper bound for the inner loop.
        const maxSecondaryIterationsPossible = Math.floor(remainingSumForOtherFactors / secondaryCoefficient);

        // Inner loop: Iterates through all possible counts for the secondary coefficient (j).
        // The loop variable `secondFactorCount` represents 'j' from the original problem.
        for (let secondFactorCount = 0; secondFactorCount <= maxSecondaryIterationsPossible; secondFactorCount++) {
            const sumFromSecondaryFactor = secondFactorCount * secondaryCoefficient;
            const remainingSumForTertiaryFactor = remainingSumForOtherFactors - sumFromSecondaryFactor;

            // Check if the final remaining sum can be perfectly divided by the tertiary coefficient.
            // If the remainder is zero, it means a valid integer count (k) for the tertiary
            // coefficient exists, completing a valid combination.
            const isPerfectlyDivisible = (remainingSumForTertiaryFactor % tertiaryCoefficient === 0);

            // If a valid combination is found, increment the counter.
            if (isPerfectlyDivisible) {
                totalValidCombinations = totalValidCombinations + 1; // Using explicit addition for variety.
            }
        }
    }

    // Phase 4: Output the Final Result
    // Display the total count of distinct combinations found to the user.
    logComputationResult(totalValidCombinations);
}

// Global Execution Block: This part of the script runs when the file is executed.
// It reads all data from standard input, assumes UTF-8 encoding, and then
// passes this raw input string to the main processing function.
const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
PerformTargetSumAnalysis(stdInputContent);