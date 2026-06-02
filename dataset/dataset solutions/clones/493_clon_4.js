const fileSystem = require('fs');
const MAX_PENALTY_VALUE = 5000;

const executeSimulation = (sourcePath) => {
    const rawContent = fileSystem.readFileSync(sourcePath, 'utf8');
    const inputLines = rawContent.trim().split("\n");
    let currentLineIndex = 0;

    const retrieveNextLine = () => {
        if (currentLineIndex < inputLines.length) {
            return inputLines[currentLineIndex++];
        }
        return null;
    };

    while (true) {
        const gameConfiguration = retrieveNextLine().split(" ").map(Number);
        const [diceCount, finalPositionTarget, eventCount] = gameConfiguration;

        if (diceCount === 0 && finalPositionTarget === 0 && eventCount === 0) {
            break;
        }

        const diceFaceValues = retrieveNextLine().split(" ").map(Number);

        const specialEventRegistry = new Map();
        for (let eventIndex = 0; eventIndex < eventCount; eventIndex++) {
            const eventDetails = retrieveNextLine().split(" ").map(Number);
            const [eventLocation, eventType, eventEffectValue] = eventDetails;
            specialEventRegistry.set(eventLocation, { type: eventType, value: eventEffectValue });
        }

        // Probability distributions: an array where each element is a Map.
        // probabilityDistributions[position] = Map<penalty_points, probability_value>
        const probabilityDistributions = Array.from({ length: finalPositionTarget + 1 }, () => new Map());
        probabilityDistributions[0].set(0, 1.0); // Initial state: position 0, 0 penalty, 100% probability

        for (let currentBoardPosition = 0; currentBoardPosition < finalPositionTarget; currentBoardPosition++) {
            // Iterate over all known (penalty, probability) states at the current board position
            for (let [currentPenaltyPoints, currentProbabilityMass] of probabilityDistributions[currentBoardPosition].entries()) {
                // Distribute this probability mass across possible next states based on dice rolls
                for (let rolledDieValue of diceFaceValues) {
                    let nextBaseBoardPosition = Math.min(finalPositionTarget, currentBoardPosition + rolledDieValue);
                    const probabilitySlice = currentProbabilityMass / diceCount;

                    let resultingBoardPosition = nextBaseBoardPosition;
                    let resultingPenaltyPoints = currentPenaltyPoints;

                    // Check for special events at the next base position
                    if (specialEventRegistry.has(nextBaseBoardPosition)) {
                        const { type: eventKind, value: eventMagnitude } = specialEventRegistry.get(nextBaseBoardPosition);
                        switch (eventKind) {
                            case 1: // Move forward
                                resultingBoardPosition = Math.min(finalPositionTarget, nextBaseBoardPosition + eventMagnitude);
                                break;
                            case 2: // Add penalty points
                                resultingPenaltyPoints = Math.min(MAX_PENALTY_VALUE, currentPenaltyPoints + eventMagnitude);
                                break;
                            case 3: // Subtract penalty points
                                resultingPenaltyPoints = Math.max(0, currentPenaltyPoints - eventMagnitude);
                                break;
                        }
                    }
                    // Accumulate probability for the new state (resultingBoardPosition, resultingPenaltyPoints)
                    probabilityDistributions[resultingBoardPosition].set(resultingPenaltyPoints,
                        (probabilityDistributions[resultingBoardPosition].get(resultingPenaltyPoints) || 0) + probabilitySlice
                    );
                }
            }
        }

        let totalExpectedPenalty = 0;
        // Calculate the expected value of penalty points at the final target position
        for (let [penaltyAmount, probabilityOfState] of probabilityDistributions[finalPositionTarget].entries()) {
            totalExpectedPenalty += penaltyAmount * probabilityOfState;
        }

        console.log(Math.floor(totalExpectedPenalty));
    }
};

executeSimulation('/dev/stdin');
