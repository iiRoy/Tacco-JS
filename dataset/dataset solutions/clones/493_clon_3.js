const SCORE_CAP_VALUE = 5000; // Defines the maximum score allowed in the probability distribution table.

/**
 * Parses a string line containing space-separated numbers into an array of numbers.
 * Handles trimming and conversion, filtering out any non-numeric results.
 * @param {string} lineContent - The string line to parse.
 * @returns {number[]} An array of numbers extracted from the line.
 */
const parseNumericLine = (lineContent) => {
    // Basic validation to ensure we're working with a string.
    if (typeof lineContent !== 'string') {
        console.error("Input for numeric line parsing must be a string.");
        return [];
    }
    const processedLine = lineContent.trim();
    // Return an empty array if the line is empty after trimming.
    if (!processedLine) {
        return [];
    }
    // Split by spaces, convert each segment to a number, and remove any NaN values.
    return processedLine.split(" ").map(Number).filter(val => !isNaN(val));
};

// Global variable to hold all input lines, making it easy to shift off lines.
let allInputSegments;

/**
 * Initializes the input processing by reading from standard input.
 */
const initializeInputReader = () => {
    const rawDataBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    allInputSegments = rawDataBuffer.trim().split("\n");
};

/**
 * Processes a single game block from the input.
 * @returns {boolean} True if a game block was processed (or attempted), false if termination condition met.
 */
const processNextGameScenario = () => {
    // Attempt to retrieve the first line for game configuration (m, n, s).
    const configLine = allInputSegments.shift();

    // If no more lines, or line is unexpectedly empty, exit.
    if (!configLine) {
        // This might indicate an incomplete file or unexpected end.
        return false;
    }

    const gameConfigValues = parseNumericLine(configLine);

    // Check for the global termination condition: "0 0 0".
    // If all three parsed values are zero, it's time to stop.
    if (gameConfigValues.length === 3 && gameConfigValues.every(val => val === 0)) {
        return false; // Signal to terminate the main loop.
    }

    // Deconstruct the game configuration parameters.
    // 'm' = number of possible moves from a square.
    // 'n' = the target square position.
    // 's' = the count of special squares.
    const [numMoveOptions_m, finalPosition_n, specialSquareCount_s] = gameConfigValues;

    // Basic validation for critical parameters.
    if (numMoveOptions_m === undefined || finalPosition_n === undefined || specialSquareCount_s === undefined ||
        numMoveOptions_m < 0 || finalPosition_n < 0 || specialSquareCount_s < 0) {
        console.error(`Invalid or incomplete game configuration found: "${configLine}". Skipping this scenario.`);
        // To properly skip, we'd need to consume the next `specialSquareCount_s + 1` lines.
        // For simplicity, we assume robust input or let subsequent shifts handle it.
        return true; // Continue to the next potential scenario.
    }

    // Read the line containing the step sizes for each move option.
    const moveStepsLine = allInputSegments.shift();
    if (!moveStepsLine) {
        console.error("Missing line for move step sizes. Skipping scenario.");
        return true;
    }
    const possibleStepSizes = parseNumericLine(moveStepsLine);

    // Validate that the number of step sizes matches the expected number of move options.
    if (possibleStepSizes.length !== numMoveOptions_m) {
        console.error(`Mismatch in move options: expected ${numMoveOptions_m}, found ${possibleStepSizes.length}. Skipping scenario.`);
        // Consume any remaining special square lines for this potentially malformed block.
        for (let i = 0; i < specialSquareCount_s; i++) {
            allInputSegments.shift();
        }
        return true;
    }

    // A Map to store the effects of special squares.
    // Key: square index, Value: [effectType, effectMagnitude].
    const gameBoardEffects = new Map();

    // Read and populate the special square effects.
    for (let effectIndex = 0; effectIndex < specialSquareCount_s; effectIndex++) {
        const effectDetailsLine = allInputSegments.shift();
        if (!effectDetailsLine) {
            console.error(`Missing special square effect line ${effectIndex + 1} of ${specialSquareCount_s}. Processing with incomplete effects.`);
            break; // Stop reading effects if a line is missing.
        }
        const parsedEffect = parseNumericLine(effectDetailsLine);
        // An effect should have 3 components: position, type, and magnitude.
        if (parsedEffect.length === 3) {
            const [effectPosition, effectType, effectMagnitude] = parsedEffect;
            gameBoardEffects.set(effectPosition, [effectType, effectMagnitude]);
        } else {
            console.warn(`Malformed effect line: "${effectDetailsLine}". Expected 3 numbers, got ${parsedEffect.length}. Skipping this specific effect.`);
        }
    }

    // Initialize the dynamic programming table.
    // dpTable[position][score] stores the probability of reaching that state.
    // The table size is (finalPosition_n + 1) rows by (SCORE_CAP_VALUE + 1) columns.
    const dpTable = Array.from({ length: finalPosition_n + 1 }, () =>
        Array(SCORE_CAP_VALUE + 1).fill(0.0)
    );

    // Set the initial state: at position 0 with score 0, the probability is 1.0 (certainty).
    dpTable[0][0] = 1.0;

    // --- Core Dynamic Programming Loop ---
    // Iterate through each possible current board position.
    for (let currentBoardPos = 0; currentBoardPos < finalPosition_n; currentBoardPos++) {
        // Iterate through each possible current score.
        for (let currentScoreValue = 0; currentScoreValue <= SCORE_CAP_VALUE; currentScoreValue++) {
            // Optimization: only process states that have a non-zero probability.
            if (dpTable[currentBoardPos][currentScoreValue] > 0) {
                // The probability of reaching the current (position, score) state.
                const stateProbability = dpTable[currentBoardPos][currentScoreValue];
                // Each move option has an equal chance (1/numMoveOptions_m) from this state.
                const probabilityPerMove = stateProbability / numMoveOptions_m;

                // Iterate through each possible move step.
                for (let moveOptionIdx = 0; moveOptionIdx < numMoveOptions_m; moveOptionIdx++) {
                    const stepToTake = possibleStepSizes[moveOptionIdx];
                    // Calculate the position after taking the step, ensuring it doesn't exceed the target position.
                    let nextBoardPos = Math.min(finalPosition_n, currentBoardPos + stepToTake);
                    let nextScoreValue = currentScoreValue; // Score initially remains unchanged.

                    // Check if the calculated next position has a special effect.
                    if (gameBoardEffects.has(nextBoardPos)) {
                        const [effectClass, effectAmount] = gameBoardEffects.get(nextBoardPos);

                        // Apply the effect based on its class.
                        switch (effectClass) {
                            case 1: // Effect Type 1: Modifies position.
                                nextBoardPos = Math.min(finalPosition_n, nextBoardPos + effectAmount);
                                break;
                            case 2: // Effect Type 2: Increases score.
                                nextScoreValue = Math.min(SCORE_CAP_VALUE, currentScoreValue + effectAmount);
                                break;
                            case 3: // Effect Type 3: Decreases score.
                                nextScoreValue = Math.max(0, currentScoreValue - effectAmount);
                                break;
                            default:
                                // Log any unexpected effect types.
                                console.warn(`Unrecognized effect type ${effectClass} at position ${nextBoardPos}. Effect will be ignored.`);
                                break;
                        }
                    }
                    // Add the calculated probability to the corresponding next state in the DP table.
                    dpTable[nextBoardPos][nextScoreValue] += probabilityPerMove;
                }
            }
        }
    }

    // --- Calculate the Expected Final Score ---
    let finalExpectedScoreAccumulator = 0.0;

    // Iterate through all possible scores at the final target position.
    for (let scoreAtEnd = 0; scoreAtEnd <= SCORE_CAP_VALUE; scoreAtEnd++) {
        // The probability of ending at the target position with this specific score.
        const probabilityForThisScore = dpTable[finalPosition_n][scoreAtEnd];
        // Accumulate the product of score and its probability.
        finalExpectedScoreAccumulator += scoreAtEnd * probabilityForThisScore;
    }

    // Output the integer part (floor) of the total expected score.
    console.log(Math.floor(finalExpectedScoreAccumulator));

    return true; // Signal to continue processing next scenario if available.
};

// Initialize the input reader to load all data.
initializeInputReader();

// Loop through and process each game scenario until the termination condition is met.
while (allInputSegments.length > 0 && processNextGameScenario()) {
    // The loop continues as long as there are lines and the scenario processor requests continuation.
}

// Script execution ends here.