const fileSystem = require('fs'); // Standard module for file system operations.

// Define constants for configuration and clarity.
const standardInputPath = '/dev/stdin'; // Path to read input from in a typical competitive programming environment.
const terminationSignal = "0 0 0"; // Specific sequence indicating the end of test cases.
const maximumScoreCapacity = 5000; // Upper bound for the score dimension in the probability matrix.

/**
 * Transforms a space-separated string of numbers into an array of integers.
 * Ensures robust parsing by specifying radix 10 for parseInt.
 * @param {string} lineContent - The string line to be parsed.
 * @returns {number[]} An array containing the parsed integer values.
 */
function extractIntegersFromLine(lineContent) {
    return lineContent.split(" ").map(stringValue => parseInt(stringValue, 10));
}

// Read all input data from the specified path at once.
// Synchronous reading is common in competitive programming to simplify logic.
const rawInputBuffer = fileSystem.readFileSync(standardInputPath, 'utf8');

// Process the raw input: remove leading/trailing whitespace, split into lines,
// and filter out any completely empty lines that might result from extra newlines.
let availableInputLines = rawInputBuffer.trim().split("\n").filter(line => line.length > 0);

// Main loop to process multiple game scenarios/test cases.
// It continues as long as there are lines to read and the termination signal is not met.
while (availableInputLines.length > 0) {
    // Retrieve and parse the primary configuration parameters for the current scenario.
    const currentConfigLine = availableInputLines.shift();
    const [boardDimension, targetFinalPosition, numberOfEvents] = extractIntegersFromLine(currentConfigLine);

    // Check if the current configuration matches the termination signal.
    // If all three parameters are zero, it signifies the end of input.
    if (boardDimension === 0 && targetFinalPosition === 0 && numberOfEvents === 0) {
        break; // Exit the processing loop.
    }

    // Read and parse the possible movement steps for this game board.
    const allowedMoveSteps = extractIntegersFromLine(availableInputLines.shift());

    // Initialize an array to store details about special events.
    // This array acts as a sparse map where the index corresponds to a board position.
    const eventDetailsByPosition = []; // Stores [eventType, effectMagnitude]

    // Populate the event details based on the number of events specified.
    for (let eventIndex = 0; eventIndex < numberOfEvents; eventIndex++) {
        const eventData = extractIntegersFromLine(availableInputLines.shift());
        const [eventBoardPosition, eventTypeIdentifier, eventEffectMagnitude] = eventData;
        // Store the event type and its magnitude at the corresponding board position.
        eventDetailsByPosition[eventBoardPosition] = [eventTypeIdentifier, eventEffectMagnitude];
    }

    // Initialize the dynamic programming table (probability matrix).
    // `dpTable[position][score]` will store the probability of reaching a specific `position`
    // with a particular `score`.
    // Dimensions: (targetFinalPosition + 1) rows x (maximumScoreCapacity + 1) columns.
    const dpTable = Array.from({ length: targetFinalPosition + 1 }, () =>
        new Array(maximumScoreCapacity + 1).fill(0.0) // Initialize all probabilities to 0.0.
    );

    // Base case: At the starting position (0) with a score of 0, the probability is 1 (100%).
    dpTable[0][0] = 1.0;

    // Iterate through each possible current position on the board.
    // The loop goes up to, but does not include, the final target position.
    for (let currentBoardPosition = 0; currentBoardPosition < targetFinalPosition; currentBoardPosition++) {
        // Iterate through each available movement option from the current position.
        for (let stepChoiceIndex = 0; stepChoiceIndex < boardDimension; stepChoiceIndex++) {
            const stepValue = allowedMoveSteps[stepChoiceIndex];
            // Calculate the potential new position after making this move.
            let nextPotentialPosition = currentBoardPosition + stepValue;

            // Ensure the `nextPotentialPosition` does not exceed the maximum allowed position.
            // If it does, it's clipped to the `targetFinalPosition`.
            if (nextPotentialPosition > targetFinalPosition) {
                nextPotentialPosition = targetFinalPosition;
            }

            // Iterate through all possible scores accumulated at the `currentBoardPosition`.
            for (let currentAccumulatedScore = 0; currentAccumulatedScore <= maximumScoreCapacity; currentAccumulatedScore++) {
                // Optimization: If there's no probability to reach the current state (position, score),
                // then there's no need to propagate from it. Skip calculation.
                if (dpTable[currentBoardPosition][currentAccumulatedScore] === 0.0) {
                    continue;
                }

                // Calculate the probability share to distribute from the current state.
                // Each move option has an equal probability (1 / boardDimension).
                const probabilityShare = dpTable[currentBoardPosition][currentAccumulatedScore] / boardDimension;

                // Check if there is a special event associated with the `nextPotentialPosition`.
                const activeEvent = eventDetailsByPosition[nextPotentialPosition];

                if (activeEvent !== undefined) {
                    // An event exists at this position; apply its effects.
                    const [eventEffectType, effectMagnitude] = activeEvent;
                    let finalBoardPosition = nextPotentialPosition;
                    let finalAccumulatedScore = currentAccumulatedScore;

                    // Apply specific rules based on the event type.
                    switch (eventEffectType) {
                        case 1: // Event Type 1: Modifies the player's position.
                            finalBoardPosition += effectMagnitude;
                            // Ensure the position remains within valid bounds [0, targetFinalPosition].
                            if (finalBoardPosition > targetFinalPosition) finalBoardPosition = targetFinalPosition;
                            if (finalBoardPosition < 0) finalBoardPosition = 0; // Guard against negative positions.
                            break;
                        case 2: // Event Type 2: Increases the player's score.
                            finalAccumulatedScore += effectMagnitude;
                            // Ensure the score does not exceed the predefined maximum.
                            if (finalAccumulatedScore > maximumScoreCapacity) finalAccumulatedScore = maximumScoreCapacity;
                            break;
                        case 3: // Event Type 3: Decreases the player's score.
                            finalAccumulatedScore -= effectMagnitude;
                            // Ensure the score does not drop below zero.
                            if (finalAccumulatedScore < 0) finalAccumulatedScore = 0;
                            break;
                        // Default case for unknown event types (should not occur with valid input).
                        default:
                            // console.warn(`Warning: Unrecognized event type '${eventEffectType}' at position ${nextPotentialPosition}.`);
                            break;
                    }
                    // Add the calculated probability share to the new, affected state.
                    dpTable[finalBoardPosition][finalAccumulatedScore] += probabilityShare;
                } else {
                    // No special event at this position; simply add probability to the state
                    // at `nextPotentialPosition` with the `currentAccumulatedScore`.
                    dpTable[nextPotentialPosition][currentAccumulatedScore] += probabilityShare;
                }
            }
        }
    }

    // After the DP table is fully populated, calculate the expected final score.
    // This is the sum of (score * probability) for all possible scores at the `targetFinalPosition`.
    let totalExpectedFinalScore = 0.0;
    // Iterate through all possible scores at the final target position.
    for (let finalScoreIterator = 0; finalScoreIterator <= maximumScoreCapacity; finalScoreIterator++) {
        totalExpectedFinalScore += finalScoreIterator * dpTable[targetFinalPosition][finalScoreIterator];
    }

    // Output the floor of the calculated expected score.
    // A check for `Number.isFinite` is included as a safeguard, although probabilities
    // should always result in finite numbers.
    if (Number.isFinite(totalExpectedFinalScore)) {
        console.log(Math.floor(totalExpectedFinalScore));
    } else {
        // In case of an unexpected non-finite result (e.g., NaN or Infinity).
        console.log(0); // Output 0 or handle error appropriately.
    }
}