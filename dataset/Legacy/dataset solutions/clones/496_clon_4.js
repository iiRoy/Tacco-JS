const createInputReader = (rawInput) => {
    const lines = rawInput.trim().split("\n");
    let currentLineIndex = 0;
    return {
        pull: () => {
            if (currentLineIndex < lines.length) {
                return lines[currentLineIndex++];
            }
            return undefined;
        }
    };
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineStream = createInputReader(rawInputData);

const parseNumericSequence = (lineContent) => lineContent.split(" ").map(Number);

while (true) {
    const currentConfigLine = lineStream.pull();
    const [boardWidth, boardHeight, specialEventCount] = parseNumericSequence(currentConfigLine);

    if (boardWidth === 0 && boardHeight === 0 && specialEventCount === 0) break;

    const diceRollOutcomes = parseNumericSequence(lineStream.pull());

    const boardEventRegistry = new Map(); // Map<position, { effectType, effectAmount }>
    for (let i = 0; i < specialEventCount; i++) {
        const [eventPosition, eventType, eventValue] = parseNumericSequence(lineStream.pull());
        boardEventRegistry.set(eventPosition, { effectType: eventType, effectAmount: eventValue });
    }

    const maxPossibleScore = 5000;
    const probabilityState = new Map(); // Map<boardPosition, Map<scoreValue, probability>>
    probabilityState.set(0, new Map([[0, 1]])); // Initial state: position 0, score 0, probability 1

    for (let currentPosition = 0; currentPosition < boardHeight; currentPosition++) {
        const scoresAtCurrentPosition = probabilityState.get(currentPosition);
        if (!scoresAtCurrentPosition) continue; // No probability to be at this position

        for (const [currentScore, currentProb] of scoresAtCurrentPosition.entries()) {
            if (currentProb === 0) continue;

            for (const rollValue of diceRollOutcomes) {
                let nextPosition = Math.min(boardHeight, currentPosition + rollValue);
                let nextScore = currentScore;
                const probContribution = currentProb / boardWidth;

                const activeEvent = boardEventRegistry.get(nextPosition);
                if (activeEvent) {
                    switch (activeEvent.effectType) {
                        case 1: // Move to a different position
                            nextPosition = Math.min(boardHeight, nextPosition + activeEvent.effectAmount);
                            break;
                        case 2: // Increase score
                            nextScore += activeEvent.effectAmount;
                            break;
                        case 3: // Decrease score
                            nextScore -= activeEvent.effectAmount;
                            break;
                    }
                }

                // Accumulate probabilities for the calculated next state
                if (!probabilityState.has(nextPosition)) {
                    probabilityState.set(nextPosition, new Map());
                }
                const targetScoreMap = probabilityState.get(nextPosition);
                targetScoreMap.set(nextScore, (targetScoreMap.get(nextScore) || 0) + probContribution);
            }
        }
    }

    let totalExpectedValue = 0;
    const finalScoresMap = probabilityState.get(boardHeight);

    if (finalScoresMap) {
        // Only sum for scores within the defined range [0, maxPossibleScore]
        for (let scoreIterator = 0; scoreIterator <= maxPossibleScore; scoreIterator++) {
            const scoreProbability = finalScoresMap.get(scoreIterator);
            if (scoreProbability) {
                totalExpectedValue += scoreIterator * scoreProbability;
            }
        }
    }
    console.log(Math.floor(totalExpectedValue));
}
