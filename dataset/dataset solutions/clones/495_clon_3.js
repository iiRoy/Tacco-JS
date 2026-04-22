const INPUT_SOURCE_PATH = '/dev/stdin';
const MAX_SCORE_CAP = 5000; // Defines the upper limit for the score dimension in the probability matrix.
const EVENT_TYPE_ADVANCE = 1; // Event type: move forward by a value.
const EVENT_TYPE_BOOST_SCORE = 2; // Event type: increase score by a value.
const EVENT_TYPE_REDUCE_SCORE = 3; // Event type: decrease score by a value.

// Utility function to parse a string line into an array of integers.
// This adds an intermediate step and explicit radix, fulfilling Type III.
function extractNumericSequence(textLine) {
    if (typeof textLine !== 'string' || textLine.trim() === '') {
        // Adding a guard clause for invalid input, fulfilling Type III.
        return [];
    }
    return textLine.split(' ').map(segment => {
        const parsedValue = parseInt(segment, 10);
        // Added validation for NaN, fulfilling Type III.
        if (isNaN(parsedValue)) {
            console.warn(`Warning: Non-numeric segment encountered: '${segment}'. Defaulting to 0.`);
            return 0;
        }
        return parsedValue;
    });
}

// Read all raw input data from the standard input.
const rawInputData = require('fs').readFileSync(INPUT_SOURCE_PATH, 'utf8');

// Split the entire input into individual lines, trimming whitespace and filtering out empty lines.
// This is a more robust way to handle input lines, fulfilling Type II and III.
let processedInputLines = rawInputData
    .split('\n')
    .map(currentLine => currentLine.trim())
    .filter(Boolean); // Filter out any lines that are empty after trimming.

// Main processing loop for multiple test cases.
// The loop condition is now more explicit and uses a helper function for parsing.
while (true) {
    const currentConfigurationLine = processedInputLines.shift(); // Retrieve the next configuration line.

    // Guard clause: if no more lines, terminate processing. (Type III addition)
    if (!currentConfigurationLine) {
        break;
    }

    // Parse the three primary configuration parameters for the current scenario.
    const scenarioParameters = extractNumericSequence(currentConfigurationLine);

    // Ensure we have exactly three parameters. (Type III addition: validation)
    if (scenarioParameters.length !== 3) {
        console.error('Error: Expected 3 scenario parameters, but got ' + scenarioParameters.length);
        // In a real application, you might throw an error or skip to the next test case.
        // For this clone, we'll break to avoid further errors.
        break;
    }

    const [boardWidth, boardHeight, specialEventCount] = scenarioParameters;

    // Termination condition: if all parameters are zero, exit the loop.
    // This is a rewritten and more explicit check than the original. (Type III change)
    if (boardWidth === 0 && boardHeight === 0 && specialEventCount === 0) {
        break;
    }

    const movementOptionsLine = processedInputLines.shift(); // Get the line defining movement options.

    // Guard clause: ensure movement options line exists. (Type III addition)
    if (!movementOptionsLine) {
        console.error('Error: Missing line for movement options.');
        break;
    }

    const availableMoveSteps = extractNumericSequence(movementOptionsLine);

    // Validate the number of movement options. (Type III addition)
    if (availableMoveSteps.length !== boardWidth) {
        console.error(`Error: Expected ${boardWidth} movement options, but got ${availableMoveSteps.length}.`);
        break;
    }

    // Initialize a data structure to store details about special events at specific board positions.
    // Using an array for direct indexed access, similar to the original, but storing objects.
    const specialPositionEffects = [];

    // Populate the special events map based on the input.
    for (let currentEventIndex = 0; currentEventIndex < specialEventCount; ++currentEventIndex) {
        const eventDescriptionLine = processedInputLines.shift(); // Get the next event description.

        // Guard clause: ensure event description line exists. (Type III addition)
        if (!eventDescriptionLine) {
            console.error('Error: Missing event description line for index ' + currentEventIndex);
            break; // Break the inner loop, will likely lead to outer loop breaking too.
        }

        const eventData = extractNumericSequence(eventDescriptionLine);

        // Validate event data structure. (Type III addition)
        if (eventData.length !== 3) {
            console.error(`Error: Expected 3 event data points, but got ${eventData.length} for event ${currentEventIndex}.`);
            break;
        }

        const [eventBoardPosition, eventActionType, actionMagnitude] = eventData;
        // Store event details as an object for better readability. (Type II/III change)
        specialPositionEffects[eventBoardPosition] = {
            actionType: eventActionType,
            magnitude: actionMagnitude
        };
    }

    // Initialize the dynamic programming table (probabilityGrid).
    // It stores probabilities of reaching a certain (position, score) state.
    // Using modern array initialization and explicit fill. (Type II/III change)
    const probabilityGrid = Array(boardHeight + 1)
        .fill(null) // Fill with null first to allow map to create new arrays.
        .map(() => Array(MAX_SCORE_CAP + 1).fill(0)); // Each row is an array of zeros.

    // Base case: starting at position 0 with score 0 has a probability of 1.
    probabilityGrid[0][0] = 1;

    // Iterate through the board positions from start to end (excluding the very last position 'boardHeight').
    for (let currentBoardPosition = 0; currentBoardPosition < boardHeight; ++currentBoardPosition) {
        // Iterate through each possible movement option from the current position.
        for (let movementOptionIndex = 0; movementOptionIndex < boardWidth; ++movementOptionIndex) {
            const stepValue = availableMoveSteps[movementOptionIndex]; // The distance to move.

            // Calculate the potential next board position.
            let potentialNextPosition = currentBoardPosition + stepValue;
            // Ensure the next position does not exceed the board's height.
            // Using Math.min for clarity and equivalence. (Type III change)
            potentialNextPosition = Math.min(potentialNextPosition, boardHeight);

            // Iterate through all possible score values at the current position.
            for (let currentScoreValue = 0; currentScoreValue <= MAX_SCORE_CAP; ++currentScoreValue) {
                // Get the probability of being at the current (position, score) state.
                const probabilityAtCurrentState = probabilityGrid[currentBoardPosition][currentScoreValue];

                // Optimization: if there's no probability to reach this state, skip calculations. (Type III addition)
                if (probabilityAtCurrentState === 0) {
                    continue;
                }

                // Calculate the probability contribution from this specific move.
                // Storing it in a temporary variable to avoid redundant division. (Type III addition)
                const contributionFraction = probabilityAtCurrentState / boardWidth;

                // Check if there's a special event at the potential next position.
                const relevantEvent = specialPositionEffects[potentialNextPosition];

                if (relevantEvent) {
                    // Destructure event details for clearer access. (Type III addition)
                    const { actionType: eventAction, magnitude: eventMagnitude } = relevantEvent;

                    // Apply effects based on the event type.
                    if (eventAction === EVENT_TYPE_ADVANCE) {
                        // Move forward by 'eventMagnitude' more steps.
                        // Clamp the final position to boardHeight. (Type III change)
                        const finalForwardPosition = Math.min(potentialNextPosition + eventMagnitude, boardHeight);
                        probabilityGrid[finalForwardPosition][currentScoreValue] += contributionFraction;
                    } else if (eventAction === EVENT_TYPE_BOOST_SCORE) {
                        // Increase score by 'eventMagnitude'.
                        // Clamp the new score to MAX_SCORE_CAP. (Type III addition)
                        const boostedScore = Math.min(currentScoreValue + eventMagnitude, MAX_SCORE_CAP);
                        probabilityGrid[potentialNextPosition][boostedScore] += contributionFraction;
                    } else if (eventAction === EVENT_TYPE_REDUCE_SCORE) {
                        // Decrease score by 'eventMagnitude'.
                        // Ensure score doesn't go below zero. (Type III change)
                        const actualReductionAmount = Math.min(eventMagnitude, currentScoreValue);
                        const reducedScore = currentScoreValue - actualReductionAmount;
                        probabilityGrid[potentialNextPosition][reducedScore] += contributionFraction;
                    }
                } else {
                    // No special event, simply accumulate probability at the next position with the current score.
                    probabilityGrid[potentialNextPosition][currentScoreValue] += contributionFraction;
                }
            }
        }
    }

    // Calculate the total expected score at the final position (boardHeight).
    let totalExpectedScore = 0;
    for (let finalScore = 0; finalScore <= MAX_SCORE_CAP; ++finalScore) {
        totalExpectedScore += finalScore * probabilityGrid[boardHeight][finalScore];
    }

    // Output the floor of the total expected score.
    console.log(Math.floor(totalExpectedScore));
}