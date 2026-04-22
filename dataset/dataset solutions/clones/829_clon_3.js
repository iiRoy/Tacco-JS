const fileSystemHandler = require('fs'); // Renamed 'fs' to 'fileSystemHandler' for clarity

// --- Configuration Constants ---
const MINIMUM_STATE_VALUE = 0; // Smallest possible state value for the DP table columns.
const MAXIMUM_STATE_VALUE = 255; // Largest possible state value for the DP table columns.
const STARTING_BALANCE_POINT = 128; // The initial state's "balance" or offset.
const UNREACHABLE_COST_MARKER = Infinity; // Sentinel value for states that haven't been reached yet.

/**
 * Constrains a given number to stay within a specified inclusive range.
 * @param {number} valueToRestrict - The number to clamp.
 * @param {number} lowerLimit - The smallest allowed value.
 * @param {number} upperLimit - The largest allowed value.
 * @returns {number} The clamped numerical value.
 */
const restrictToRange = (valueToRestrict, lowerLimit, upperLimit) => {
    return Math.max(lowerLimit, Math.min(valueToRestrict, upperLimit));
};

/**
 * Computes the square of the difference between two numerical inputs.
 * Using `(a - b) * (a - b)` is generally faster than `Math.pow(a - b, 2)`.
 * @param {number} firstOperand - The minuend.
 * @param {number} secondOperand - The subtrahend.
 * @returns {number} The squared difference.
 */
const computeSquaredDifference = (firstOperand, secondOperand) => {
    const delta = firstOperand - secondOperand;
    return delta * delta;
};

// --- Input Processing ---

// Read the entire standard input stream as a UTF-8 string.
const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines, remove leading/trailing whitespace from each,
// and then filter out any entirely empty lines.
let processedInputLines = rawInputContent
    .split('\n')
    .map(lineText => lineText.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

// --- Main Application Loop ---

// This loop continues to process sets of data until a specific termination signal is found.
mainProcessingLoop: while (true) {
    // Retrieve the next line, which should contain the problem's dimensions (N and M).
    const currentDimensionLine = processedInputLines.shift();

    // If there are no more lines, it indicates the end of input or an unexpected state.
    if (!currentDimensionLine) {
        break mainProcessingLoop;
    }

    const dimensionParts = currentDimensionLine.split(' ');

    // Parse the number of target elements (N) and modifier elements (M).
    const numberOfElementsN = parseInt(dimensionParts[0], 10);
    const numberOfElementsM = parseInt(dimensionParts[1], 10);

    // Check for the problem termination condition: N=0 and M=0.
    if (numberOfElementsN === 0 && numberOfElementsM === 0) {
        break mainProcessingLoop; // Exit the main loop.
    }

    // --- Data Collection for Current Instance ---

    // Array to hold the 'M' values (modifiers).
    const modifierSet = [];
    for (let k = 0; k < numberOfElementsM; k++) {
        const modifierString = processedInputLines.shift();
        if (modifierString === undefined || modifierString === null) {
            console.error("Error: Insufficient modifier values in input.");
            break mainProcessingLoop; // Abort if input is malformed.
        }
        modifierSet.push(parseInt(modifierString, 10));
    }

    // Array to hold the 'N' values (targets).
    const targetSet = [];
    for (let i = 0; i < numberOfElementsN; i++) {
        const targetString = processedInputLines.shift();
        if (targetString === undefined || targetString === null) {
            console.error("Error: Insufficient target values in input.");
            break mainProcessingLoop; // Abort if input is malformed.
        }
        targetSet.push(parseInt(targetString, 10));
    }

    // --- Dynamic Programming Table Initialization ---

    // The DP table, `dpTable[row][col]`, stores the minimum cost to reach 'col' state
    // after processing 'row' target elements.
    // Dimensions: (numberOfElementsN + 1) rows, (MAXIMUM_STATE_VALUE + 1) columns.
    // Initialized with UNREACHABLE_COST_MARKER (Infinity) to facilitate `Math.min` updates.
    const dpTable = Array.from({ length: numberOfElementsN + 1 }, () =>
        Array(MAXIMUM_STATE_VALUE + 1).fill(UNREACHABLE_COST_MARKER)
    );

    // Base case: At step 0 (before any target elements are processed),
    // the cost to be at the `STARTING_BALANCE_POINT` state is 0.
    dpTable[0][STARTING_BALANCE_POINT] = 0;

    // --- DP Computation ---

    // Iterate through each target element (from 1 up to N).
    for (let currentNIndex = 1; currentNIndex <= numberOfElementsN; currentNIndex++) {
        // The actual value from the targetSet for the current step.
        const currentTargetValue = targetSet[currentNIndex - 1];

        // Iterate through all possible previous states (from MINIMUM_STATE_VALUE to MAXIMUM_STATE_VALUE).
        for (let previousBalanceState = MINIMUM_STATE_VALUE; previousBalanceState <= MAXIMUM_STATE_VALUE; previousBalanceState++) {
            // Only consider paths from reachable previous states.
            if (dpTable[currentNIndex - 1][previousBalanceState] !== UNREACHABLE_COST_MARKER) {
                // The cost accumulated up to the previous state.
                const costFromPriorStep = dpTable[currentNIndex - 1][previousBalanceState];

                // Iterate through all available modifier values.
                for (let currentMIndex = 0; currentMIndex < numberOfElementsM; currentMIndex++) {
                    const currentModifier = modifierSet[currentMIndex];

                    // Calculate the provisional next state balance by applying the modifier.
                    const rawNextBalanceState = previousBalanceState + currentModifier;

                    // Ensure the next state balance stays within the defined bounds [0, 255].
                    const finalNextBalanceState = restrictToRange(
                        rawNextBalanceState,
                        MINIMUM_STATE_VALUE,
                        MAXIMUM_STATE_VALUE
                    );

                    // Calculate the cost incurred by this specific transition.
                    const currentTransitionPenalty = computeSquaredDifference(currentTargetValue, finalNextBalanceState);

                    // The total cost to reach `finalNextBalanceState` at `currentNIndex` step via this path.
                    const totalPathCost = costFromPriorStep + currentTransitionPenalty;

                    // Update the DP table: store the minimum cost found so far for this state.
                    dpTable[currentNIndex][finalNextBalanceState] = Math.min(
                        dpTable[currentNIndex][finalNextBalanceState],
                        totalPathCost
                    );
                }
            }
        }
    }

    // --- Final Result Aggregation ---

    // After filling the DP table, the minimum total cost will be the smallest value
    // in the last row of the table (corresponding to numberOfElementsN).
    let minimumOverallCost = UNREACHABLE_COST_MARKER;

    // Iterate through all possible final states in the last row.
    for (const finalStateAccumulatedCost of dpTable[numberOfElementsN]) {
        minimumOverallCost = Math.min(minimumOverallCost, finalStateAccumulatedCost);
    }

    // Output the computed minimum cost for the current problem instance.
    console.log(`${minimumOverallCost}`);
}