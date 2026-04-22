/*
 * This JavaScript module is designed to process numerical inputs and perform a specific
 * set of calculations to determine a binary outcome (Yes/No equivalent).
 * It reads two lines of data from standard input:
 * - The first line contains three space-separated numeric values.
 * - The second line contains a single numeric threshold value.
 *
 * The core functionality involves computing two "step counts" based on the ratios
 * of these input numbers, applying a non-linear conditional logic. These step counts
 * are then summed and compared against the provided threshold.
 */

/**
 * Computes a specific "growth factor step" value based on how a base number
 * relates to a target number through powers of two. This function encapsulates
 * a precise set of conditional rules, including edge cases for equality and
 * when the base value is already greater than the target. If the target value
 * is significantly larger (more than 8 times) than the base, it returns null,
 * mirroring an unassigned variable state from the original logic.
 *
 * @param {number} currentTargetValue The value that needs to be reached or surpassed (like 'A' or 'B').
 * @param {number} referenceBaseValue The value that is multiplied (like 'B' or 'C').
 * @returns {number|null} An integer representing the steps (0, 1, 2, or 3), or null if no
 *                        matching condition is found (e.g., targetValue / baseValue > 8).
 */
const determineGrowthFactorSteps = (currentTargetValue, referenceBaseValue) => {

    // --- Type III Addition: Input validation for robustness ---
    // A non-positive reference base value would lead to division by zero or nonsensical ratios.
    // Returning null here aligns with the "unmatched condition" scenario.
    if (referenceBaseValue <= 0) {
        // console.warn("Warning: Non-positive reference base value encountered. Returning null steps.");
        return null;
    }

    const calculatedRatio = currentTargetValue / referenceBaseValue;
    let assignedStepCount = null; // Initialize to null to reflect an 'unassigned' state if no condition matches.

    // --- Rephrased conditional logic with extensive whitespace and different structure ---

    // Scenario 1: The reference base is already greater than the target.
    if (referenceBaseValue > currentTargetValue) {
        assignedStepCount = 0;
    }
    // Scenario 2: The reference base is exactly equal to the target.
    else if (referenceBaseValue === currentTargetValue) {
        assignedStepCount = 1;
    }
    // Scenario 3: The reference base is less than the target, but 2 times the base
    //             is sufficient to reach or exceed the target.
    else if (calculatedRatio <= 2.0) { // Equivalent to (currentTargetValue <= 2 * referenceBaseValue)
        assignedStepCount = 1;
    }
    // Scenario 4: The target is more than 2 times but not more than 4 times the base.
    else if (calculatedRatio <= 4.0) { // Equivalent to (currentTargetValue <= 4 * referenceBaseValue)
        assignedStepCount = 2;
    }
    // Scenario 5: The target is more than 4 times but not more than 8 times the base.
    else if (calculatedRatio <= 8.0) { // Equivalent to (currentTargetValue <= 8 * referenceBaseValue)
        assignedStepCount = 3;
    }
    // If none of the above conditions are met, `assignedStepCount` remains null.
    // This behavior is crucial for mimicking the original code's implicit 'undefined'
    // state for `i` or `p` when `targetValue / baseValue` is greater than 8.

    return assignedStepCount;
};

/**
 * The primary execution function that orchestrates reading input, performing calculations,
 * and outputting the final decision. This function is a Type III clone of the original `main` function.
 *
 * @param {string} rawInputContent The entire input content as a single string.
 */
const executeMainProcess = (rawInputContent) => {

    // --- Type III Changes: Input parsing and validation ---

    // Split the raw input string into an array of individual lines.
    const processedInputLines = rawInputContent
                                    .trim() // Remove any leading/trailing whitespace from the entire input block.
                                    .split('\n'); // Divide into lines based on newline characters.

    // Validate that we have at least two lines of input data.
    if (processedInputLines.length < 2) {
        console.error("Critical Error: Insufficient data lines provided in input. Expected 2 lines.");
        return; // Terminate execution due to invalid input.
    }

    // Parse the first line, which contains three primary numerical components.
    const firstLineData = processedInputLines[0];
    const numericalComponents = firstLineData
                                    .split(' ') // Split by space to get individual string numbers.
                                    .map(strValue => {
                                        const num = parseFloat(strValue); // Use parseFloat for robust parsing.
                                        if (isNaN(num)) {
                                            // Type III Addition: Handle non-numeric input gracefully.
                                            console.error(`Input Error: Encountered non-numeric data '${strValue}'. Defaulting to 0.`);
                                            return 0; // Provide a default or throw an error based on requirements.
                                        }
                                        return num;
                                    });

    // Destructure and rename the primary numerical values for clarity.
    const initialNumericX = numericalComponents[0]; // Corresponds to original 'A'
    const intermediateNumericY = numericalComponents[1]; // Corresponds to original 'B'
    const finalNumericZ = numericalComponents[2]; // Corresponds to original 'C'

    // Parse the second line to obtain the limiting threshold value.
    const thresholdString = processedInputLines[1];
    const allowedStepLimit = parseInt(thresholdString, 10); // Corresponds to original 'K'

    // Type III Addition: Validate the parsed threshold.
    if (isNaN(allowedStepLimit)) {
        console.error("Input Error: The provided step limit is not a valid number.");
        return; // Terminate if the threshold is invalid.
    }

    // --- Type III Changes: Calculation of intermediate step counts ---

    // Calculate the first set of transformation steps, equivalent to original 'i'.
    // `initialNumericX` is the target, `intermediateNumericY` is the base.
    const firstTransformationSteps = determineGrowthFactorSteps(initialNumericX, intermediateNumericY);

    // Calculate the second set of transformation steps, equivalent to original 'p'.
    // `intermediateNumericY` is the target, `finalNumericZ` is the base.
    // This implicitly corrects the `2*2*V` typo from the original to `2*2*C`.
    const secondTransformationSteps = determineGrowthFactorSteps(intermediateNumericY, finalNumericZ);

    // --- Type III Addition: Early exit for unmatchable conditions ---

    // If either calculation returned null (meaning target/base > 8 or invalid base),
    // the original code would result in `i` or `p` being undefined, leading to `NaN` in `i+p`.
    // `NaN <= K` is always `false`, so the outcome would be "No".
    // This guard clause provides an explicit and clearer way to achieve the same functional result.
    if (firstTransformationSteps === null || secondTransformationSteps === null) {
        console.log("Outcome: Negative - One or more step calculations were out of defined range.");
        return;
    }

    // --- Type III Changes: Final comparison and output ---

    // Sum the two calculated step counts.
    const totalAccumulatedSteps = firstTransformationSteps + secondTransformationSteps;

    // Determine the final result message based on the comparison with the threshold.
    let finalResultMessage;
    if (totalAccumulatedSteps <= allowedStepLimit) {
        finalResultMessage = "Outcome: Positive - All conditions successfully met!";
    } else {
        finalResultMessage = "Outcome: Negative - Total steps exceeded the allowed limit.";
    }

    // Display the final conclusion.
    console.log(finalResultMessage);

};

// --- Global execution block ---
// This line initiates the entire process by reading from standard input
// and passing the content to our main processing function.
// The original code had a stray '}' character before this line, which has been removed.
executeMainProcess(require("fs").readFileSync("/dev/stdin", "utf8"));