function calculateMinimumMoves(startingArrangement) {
    const desiredOrder = "01234567";
    
    let explorationQueue = [];
    let recordedDistances = new Map();

    const startingString = startingArrangement.map(String).join('');

    explorationQueue.push({ layout: startingString, currentSteps: 0 });
    recordedDistances.set(startingString, 0);

    let queueHead = 0;

    while (queueHead < explorationQueue.length) {
        const { layout: presentLayout, currentSteps: stepsTaken } = explorationQueue[queueHead++];

        if (presentLayout === desiredOrder) {
            return stepsTaken;
        }

        const blankSpaceIndex = presentLayout.indexOf('0');
        const displacementOptions = [-1, 1, -4, 4]; // Represents Left, Right, Up, Down movements on a 2x4 grid

        for (const displacement of displacementOptions) {
            const nextBlankSpaceIndex = blankSpaceIndex + displacement;

            if (nextBlankSpaceIndex >= 0 && nextBlankSpaceIndex < 8) {
                // Specific rules for a 2x4 grid to prevent horizontal wraps
                if (
                    (blankSpaceIndex === 3 && displacement === 1) || // Moving from index 3 to 4 (right)
                    (blankSpaceIndex === 4 && displacement === -1)    // Moving from index 4 to 3 (left)
                ) {
                    continue; // Skip this invalid move
                }

                const layoutCharacters = presentLayout.split('');
                [layoutCharacters[blankSpaceIndex], layoutCharacters[nextBlankSpaceIndex]] = 
                [layoutCharacters[nextBlankSpaceIndex], layoutCharacters[blankSpaceIndex]];
                const nextLayout = layoutCharacters.join('');

                if (!recordedDistances.has(nextLayout)) {
                    recordedDistances.set(nextLayout, stepsTaken + 1);
                    explorationQueue.push({ layout: nextLayout, currentSteps: stepsTaken + 1 });
                }
            }
        }
    }

    return -1; // Indicates no solution found (should not happen for valid puzzles)
}