const fileSystem = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';
const INITIAL_COLOR_STATE_VALUE = 128;
const MIN_PIXEL_INTENSITY = 0;
const MAX_PIXEL_INTENSITY = 255;
const TERMINATION_PAIR_VALUE = 0; // Used for both N and M in the termination check

// Helper function to safely parse an integer from a string.
// Includes basic validation to ensure a non-negative integer.
const parsePositiveInteger = (stringValue) => {
    const numericVal = parseInt(stringValue, 10);
    // If parsing fails or the number is negative, return 0 as a default or handle error.
    // Assuming valid input as per original problem context.
    return (isNaN(numericVal) || numericVal < 0) ? 0 : numericVal;
};

// Read all input data, decode as UTF-8, split into lines, and filter out empty lines.
let remainingInputLines = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8')
                                    .split('\n')
                                    .filter(line => line.length > 0);

// Main processing loop for multiple test cases.
while (true) {
    // Retrieve the current line containing the dimensions (N and M).
    const currentDimensionLine = remainingInputLines.shift();

    // Guard clause: If no more input lines are available, terminate the process.
    if (currentDimensionLine === undefined) {
        break;
    }
    
    // Split the dimension line into two string parts.
    const [numRowsStr, numColsStr] = currentDimensionLine.split(' ');
    
    // Parse the dimension strings into integer values.
    const numTargetValues = parsePositiveInteger(numRowsStr); // Corresponds to 'n'
    const numModificationOptions = parsePositiveInteger(numColsStr); // Corresponds to 'm'

    // Termination condition: If both dimensions are 0, exit the loop.
    if (numTargetValues === TERMINATION_PAIR_VALUE && numModificationOptions === TERMINATION_PAIR_VALUE) {
        break;
    }

    // Prepare arrays to store the data for the current test case.
    // 'modOptions' holds the M array values.
    const colorModificationOptions = [];
    // 'intensityTargets' holds the N array values.
    const desiredIntensityTargets = [];

    // Helper function to read a specified number of numeric values from the input stream.
    const extractNumericBlock = (count) => {
        const block = [];
        for (let idx = 0; idx < count; idx++) {
            const nextLine = remainingInputLines.shift();
            // Robustness: check if a line was actually available.
            if (nextLine === undefined) {
                // This indicates an unexpected end of input, which might be an error in real scenarios.
                // For cloning, we'll just stop reading for this block and continue.
                break; 
            }
            block.push(parsePositiveInteger(nextLine));
        }
        return block;
    };

    // Populate the colorModificationOptions array.
    colorModificationOptions.push(...extractNumericBlock(numModificationOptions));

    // Populate the desiredIntensityTargets array.
    desiredIntensityTargets.push(...extractNumericBlock(numTargetValues));

    // --- Dynamic Programming Table Initialization ---
    // 'minCostMatrix' stores the minimum cumulative cost to reach a certain state.
    // Dimensions: (numTargetValues + 1) rows by (MAX_PIXEL_INTENSITY + 1) columns.
    const minCostMatrix = Array.from({ length: numTargetValues + 1 }, () =>
        Array.from({ length: MAX_PIXEL_INTENSITY + 1 }, () => Infinity)
    );

    // Set the base case: at step 0, the cost to be at the initial color state (128) is 0.
    minCostMatrix[0][INITIAL_COLOR_STATE_VALUE] = 0;

    // --- DP State Transition Calculation Loop ---
    // Outer loop iterates through each step (or target value) from 1 to numTargetValues.
    for (let currentStepIdx = 1; currentStepIdx <= numTargetValues; currentStepIdx++) {
        // Inner loop iterates through all possible previous pixel intensity values.
        for (let prevPixelIntensity = MIN_PIXEL_INTENSITY; prevPixelIntensity <= MAX_PIXEL_INTENSITY; prevPixelIntensity++) {
            const costToReachPrevState = minCostMatrix[currentStepIdx - 1][prevPixelIntensity];

            // Optimization: Only proceed if the previous state was actually reachable.
            if (costToReachPrevState !== Infinity) {
                // Innermost loop: consider each available color modification option.
                for (let modOptionIdx = 0; modOptionIdx < numModificationOptions; modOptionIdx++) {
                    const currentModificationDelta = colorModificationOptions[modOptionIdx];
                    
                    // Calculate the theoretical new pixel intensity.
                    let rawNewPixelIntensity = prevPixelIntensity + currentModificationDelta;

                    // Clamp the new intensity value to stay within the valid [0, 255] range.
                    const clampedPixelIntensity = Math.max(
                        MIN_PIXEL_INTENSITY,
                        Math.min(MAX_PIXEL_INTENSITY, rawNewPixelIntensity)
                    );

                    // Retrieve the target intensity for the current step.
                    const currentDesiredTarget = desiredIntensityTargets[currentStepIdx - 1];

                    // Calculate the squared difference cost for this transition.
                    const intensityDifference = currentDesiredTarget - clampedPixelIntensity;
                    const transitionPenalty = intensityDifference * intensityDifference; // Equivalent to Math.pow(diff, 2)

                    // Update the minimum cost to reach 'clampedPixelIntensity' at 'currentStepIdx'.
                    const cumulativeCost = costToReachPrevState + transitionPenalty;
                    minCostMatrix[currentStepIdx][clampedPixelIntensity] = Math.min(
                        minCostMatrix[currentStepIdx][clampedPixelIntensity],
                        cumulativeCost
                    );
                }
            }
        }
    }

    // --- Determine the Overall Minimum Cost ---
    // After all calculations, the minimum cost for the entire sequence is the smallest value
    // found in the last row of the 'minCostMatrix'.
    let totalMinimumAchievedCost = Infinity;
    const finalCostsRow = minCostMatrix[numTargetValues];

    // Iterate through the final row to find the absolute minimum cost.
    for (const costValue of finalCostsRow) {
        totalMinimumAchievedCost = Math.min(totalMinimumAchievedCost, costValue);
    }

    // Output the result for the current test case.
    console.log(totalMinimumAchievedCost);
}