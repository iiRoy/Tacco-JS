const fileSystemHandler = require("fs");

// Define a constant for the standard input file path.
const standardInputPath = "/dev/stdin";

/**
 * Calculates the minimum number of operations required to make a sequence of cumulative sums
 * alternate in sign (e.g., pos, neg, pos, neg or neg, pos, neg, pos).
 * This function encapsulates the entire processing logic.
 */
function processAlternatingSumAdjustments() {
    let rawInputData;
    try {
        // Attempt to read the entire content of the standard input file.
        // Using 'utf8' encoding to properly handle text data.
        rawInputData = fileSystemHandler.readFileSync(standardInputPath, "utf8");
    } catch (dataReadError) {
        // If an error occurs during file reading, log it and terminate the process.
        console.error("Failed to read input data from standard input:", dataReadError.message);
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }

    // Trim any leading/trailing whitespace from the raw data and split it into lines.
    const dataLines = rawInputData.trim().split('\n');

    // Basic validation: ensure there are at least two lines of input.
    if (dataLines.length < 2) {
        console.error("Insufficient input lines. Expected at least two lines: count and numbers.");
        process.exit(1);
    }

    // Parse the first line to get the expected number of elements.
    // Using parseInt with radix 10 for explicit base conversion.
    const expectedElementCount = parseInt(dataLines[0], 10);

    // Validate the parsed element count.
    if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        console.error("Invalid or non-positive element count provided:", dataLines[0]);
        process.exit(1);
    }

    // Parse the second line, splitting by spaces and converting to numbers.
    // Filter out any empty strings that might result from multiple spaces.
    const numericSequence = dataLines[1].split(' ').filter(str => str !== '').map(strVal => {
        const parsedNum = Number(strVal);
        // Validate each number in the sequence.
        if (isNaN(parsedNum)) {
            console.error("Non-numeric value detected in input sequence:", strVal);
            process.exit(1);
        }
        return parsedNum;
    });

    // Determine the actual number of elements to process,
    // taking the minimum of the expected count and the parsed sequence length.
    const actualSequenceLength = Math.min(expectedElementCount, numericSequence.length);

    // --- Calculation Scenario 1: Target starts with a positive sum for the first element ---
    let totalCostScenarioA = 0; // Accumulates the operations for this scenario.
    let currentRunningSumA = 0; // Maintains the current cumulative sum.

    // Iterate through the numeric sequence using a for loop with pre-increment.
    for (let currentElementIndex = 0; currentElementIndex < actualSequenceLength; ++currentElementIndex) {
        // Determine the parity of the current index: 0 for even, 1 for odd.
        // This dictates the desired sign of the cumulative sum at this position.
        const isOddPositionA = currentElementIndex % 2;

        // If 'isOddPositionA' is 0 (even index), the target sum should be positive (>0).
        // If 'isOddPositionA' is 1 (odd index), the target sum should be negative (<0).
        const requiresPositiveSumA = (isOddPositionA === 0);

        // Calculate the sum if the current element is added without adjustment.
        const hypotheticalSumA = currentRunningSumA + numericSequence[currentElementIndex];

        // Check if the hypothetical sum meets the required sign condition.
        if ((requiresPositiveSumA && hypotheticalSumA > 0) || (!requiresPositiveSumA && hypotheticalSumA < 0)) {
            // Condition met: simply update the running sum.
            currentRunningSumA = hypotheticalSumA;
        } else {
            // Condition not met: an adjustment is needed.
            // The target value for the sum is 1 if positive is required, -1 if negative is required.
            const forcedTargetValueA = requiresPositiveSumA ? 1 : -1;

            // Calculate the absolute difference between the hypothetical sum and the forced target.
            // This difference represents the number of operations to make the sum valid.
            const adjustmentMagnitudeA = Math.abs(hypotheticalSumA - forcedTargetValueA);
            totalCostScenarioA += adjustmentMagnitudeA;

            // Force the running sum to the target value.
            currentRunningSumA = forcedTargetValueA;
        }
    }

    // --- Calculation Scenario 2: Target starts with a negative sum for the first element ---
    let totalCostScenarioB = 0; // Accumulates operations for this scenario.
    let currentRunningSumB = 0; // Maintains the current cumulative sum.

    // Iterate through the numeric sequence again, using a different loop increment style.
    for (let currentElementIndex = 0; currentElementIndex < actualSequenceLength; currentElementIndex++) {
        // Determine the 'shifted' parity of the current index:
        // (index + 1) % 2 effectively reverses the parity requirements compared to Scenario 1.
        const isOddPositionB = (currentElementIndex + 1) % 2;

        // If 'isOddPositionB' is 0, the target sum should be positive (>0).
        // If 'isOddPositionB' is 1, the target sum should be negative (<0).
        const requiresPositiveSumB = (isOddPositionB === 0);

        // Calculate the sum if the current element is added without adjustment.
        const hypotheticalSumB = currentRunningSumB + numericSequence[currentElementIndex];

        // Check if the hypothetical sum meets the required sign condition.
        if ((requiresPositiveSumB && hypotheticalSumB > 0) || (!requiresPositiveSumB && hypotheticalSumB < 0)) {
            // Condition met: simply update the running sum.
            currentRunningSumB = hypotheticalSumB;
        } else {
            // Condition not met: an adjustment is needed.
            const forcedTargetValueB = requiresPositiveSumB ? 1 : -1;
            const adjustmentMagnitudeB = Math.abs(hypotheticalSumB - forcedTargetValueB);
            totalCostScenarioB += adjustmentMagnitudeB;
            currentRunningSumB = forcedTargetValueB;
        }
    }

    // Output the minimum of the two calculated costs to standard output.
    console.log(Math.min(totalCostScenarioA, totalCostScenarioB));
}

// Invoke the main processing function to start the execution.
processAlternatingSumAdjustments();